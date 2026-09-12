import type { Route } from './routes';
import type { RoutePosition } from './route-position';

export type EtaApiStatus =
  | 'available'
  | 'average_wait'
  | 'out_of_service'
  | 'no_route'
  | 'insufficient_data'
  | 'invalid_input'
  | 'version_mismatch'
  | 'backend_error';

export type EtaApiResult = {
  status: EtaApiStatus;
  etaMinutes: number | null;
  estimatedArrivalAt: string | null;
  method: string;
  dataVersion: string | null;
  assumptions: {
    timezone: 'America/Lima';
    waitPoint?: string;
    note: string;
    vehicleTracking: false;
    realTimeTraffic: false;
    occupancy: false;
  } & Record<string, unknown>;
};

export type EtaRequestPayload = {
  routeId: string;
  directionId: string;
  referenceId?: string;
  waitPosition?: { segmentIndex: number; fraction: number };
  expectedDataVersion?: string;
};

export class EtaClientError extends Error {
  constructor(
    public readonly code: 'configuration' | 'app_check' | 'timeout' | 'network' | 'backend' | 'invalid_response',
    message: string,
    public readonly httpStatus = 0
  ) {
    super(message);
    this.name = 'EtaClientError';
  }
}

type TokenProvider = () => Promise<string | null>;
let appCheckTokenProvider: TokenProvider | null = null;

export function configureAppCheckTokenProvider(provider: TokenProvider): void {
  appCheckTokenProvider = provider;
}

function emulatorEnabled(): boolean {
  return process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true';
}

function resolveEndpoint(): string {
  const configured = process.env.EXPO_PUBLIC_ETA_ENDPOINT;
  if (configured) return configured;
  if (emulatorEnabled()) {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    if (host && projectId) return `http://${host}:5001/${projectId}/us-central1/eta`;
  }
  throw new EtaClientError('configuration', 'El endpoint ETA no está configurado.');
}

function isEtaResult(value: unknown): value is EtaApiResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<EtaApiResult>;
  return (
    typeof result.status === 'string' &&
    (result.etaMinutes === null || Number.isFinite(result.etaMinutes)) &&
    (result.estimatedArrivalAt === null || typeof result.estimatedArrivalAt === 'string') &&
    typeof result.method === 'string' &&
    (result.dataVersion === null || typeof result.dataVersion === 'string') &&
    !!result.assumptions &&
    result.assumptions.timezone === 'America/Lima'
  );
}

export async function requestEta(
  payload: EtaRequestPayload,
  options: {
    endpoint?: string;
    token?: string | null;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
    signal?: AbortSignal;
  } = {}
): Promise<EtaApiResult> {
  const endpoint = options.endpoint ?? resolveEndpoint();
  const token = options.token !== undefined
    ? options.token
    : emulatorEnabled()
      ? null
      : await appCheckTokenProvider?.() ?? null;
  if (!emulatorEnabled() && !token) {
    throw new EtaClientError('app_check', 'La verificación App Check no está disponible en este dispositivo.');
  }
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
  try {
    const response = await (options.fetchImpl ?? fetch)(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Firebase-AppCheck': token } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!isEtaResult(body)) {
      throw new EtaClientError('invalid_response', 'El servicio devolvió una respuesta no reconocida.', response.status);
    }
    if (!response.ok) {
      throw new EtaClientError(
        response.status >= 500 ? 'backend' : 'invalid_response',
        body.assumptions.note,
        response.status
      );
    }
    return body;
  } catch (error) {
    if (error instanceof EtaClientError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new EtaClientError('timeout', 'La consulta tardó demasiado y fue cancelada.');
    }
    throw new EtaClientError('network', 'No fue posible conectar con el servicio ETA.');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function getEta(
  route: Route,
  waitPoint: RoutePosition,
  dataVersion: string,
  signal?: AbortSignal
): Promise<EtaApiResult> {
  return requestEta(
    {
      routeId: route.id,
      directionId: waitPoint.sequenceId,
      ...(waitPoint.source === 'reference'
        ? { referenceId: waitPoint.id }
        : { waitPosition: { segmentIndex: waitPoint.segmentIndex, fraction: waitPoint.fraction } }),
      expectedDataVersion: dataVersion,
    },
    { signal }
  );
}
