import { initializeApp } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { onRequest } from 'firebase-functions/v2/https';
import type { Request } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { inferEta, validateEtaRequest } from './eta-engine.js';
import { OPERATION_TIME_ZONE, type EtaResponse } from './contracts.js';
import { readActiveSnapshot } from './snapshot-store.js';

initializeApp();

const MAX_BODY_BYTES = 8_192;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 30;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function errorResponse(status: EtaResponse['status'], note: string, dataVersion: string | null = null): EtaResponse {
  return {
    status,
    etaMinutes: null,
    estimatedArrivalAt: null,
    method: 'none',
    dataVersion,
    assumptions: {
      timezone: OPERATION_TIME_ZONE,
      vehicleTracking: false,
      realTimeTraffic: false,
      occupancy: false,
      note,
    },
  };
}

function clientKey(request: Request): string {
  return request.ip || 'anonymous';
}

function exceedsRateLimit(request: Request, now = Date.now()): boolean {
  if (rateLimits.size > 1_000) {
    for (const [candidate, value] of rateLimits) {
      if (value.resetAt <= now) rateLimits.delete(candidate);
    }
  }
  const key = clientKey(request);
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_REQUESTS;
}

async function verifyAppCheck(request: Request): Promise<boolean> {
  if (process.env.FUNCTIONS_EMULATOR === 'true') return true;
  const token = request.header('X-Firebase-AppCheck');
  if (!token) return false;
  try {
    await getAppCheck().verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export const eta = onRequest(
  {
    cors: false,
    timeoutSeconds: 15,
    memory: '256MiB',
    maxInstances: 10,
    concurrency: 20,
  },
  async (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.set('Content-Type', 'application/json; charset=utf-8');
    if (request.method !== 'POST') {
      response.status(405).json(errorResponse('invalid_input', 'Usa POST con un cuerpo JSON válido.'));
      return;
    }
    const contentLength = Number(request.header('content-length') ?? '0');
    const receivedBytes = Math.max(contentLength, request.rawBody?.byteLength ?? 0);
    if (!Number.isFinite(receivedBytes) || receivedBytes > MAX_BODY_BYTES) {
      response.status(413).json(errorResponse('invalid_input', 'La consulta supera el tamaño permitido.'));
      return;
    }
    if (exceedsRateLimit(request)) {
      response.set('Retry-After', '60');
      response.status(429).json(errorResponse('invalid_input', 'Demasiadas consultas; inténtalo nuevamente en un minuto.'));
      return;
    }
    if (!(await verifyAppCheck(request))) {
      response.status(401).json(errorResponse('invalid_input', 'No fue posible verificar la integridad de la aplicación.'));
      return;
    }
    const validated = validateEtaRequest(request.body);
    if (!validated.valid) {
      response.status(400).json(errorResponse('invalid_input', validated.message));
      return;
    }
    try {
      const requestStartedAt = performance.now();
      const snapshot = await readActiveSnapshot();
      const snapshotReadyAt = performance.now();
      const result = inferEta(snapshot, validated.request, new Date());
      const responseReadyAt = performance.now();
      response.set(
        'Server-Timing',
        `firestore;dur=${(snapshotReadyAt - requestStartedAt).toFixed(2)}, eta;dur=${(responseReadyAt - snapshotReadyAt).toFixed(2)}, app;dur=${(responseReadyAt - requestStartedAt).toFixed(2)}`
      );
      response.status(result.status === 'version_mismatch' ? 409 : 200).json(result);
    } catch (error) {
      logger.error('ETA backend failure', {
        code: error instanceof Error ? error.message : 'unknown',
      });
      response.status(503).json(errorResponse('backend_error', 'El servicio de estimación no está disponible temporalmente.'));
    }
  }
);
