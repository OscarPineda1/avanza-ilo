import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAllRoutes, ROUTE_CATALOG_METADATA } from '../../src/services/routes';
import {
  VALIDATED_OPERATIONAL_DATA_VERSION,
  VALIDATED_OPERATIONAL_DECISION,
  VALIDATED_OPERATIONAL_SOURCE,
  buildValidatedOperationalRoutes,
} from '../../src/services/validated-operational-scenario';
import type { PublishedSnapshot } from '../src/contracts';
import { publishValidatedSnapshot } from '../src/publication';
import { validateProductionReadiness, validatePublishedSnapshot } from '../src/snapshot-validator';

type FirestoreValue = Record<string, unknown>;

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)])
        ),
      },
    };
  }
  throw new Error('El snapshot contiene un tipo que Firestore no admite.');
}

function toFirestoreFields(value: Record<string, unknown>): Record<string, FirestoreValue> {
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)])
  );
}

async function publishWithEphemeralAccessToken(
  projectId: string,
  token: string,
  snapshot: PublishedSnapshot
) {
  const validation = validatePublishedSnapshot(snapshot);
  if (!validation.valid) return { published: false as const, validation };
  const root = `projects/${projectId}/databases/(default)/documents`;
  const document = (path: string, data: Record<string, unknown>) => ({
    update: { name: `${root}/${path}`, fields: toFirestoreFields(data) },
  });
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [
          document(`publishedSnapshots/${snapshot.dataVersion}`, snapshot),
          document('publication/current', {
            dataVersion: snapshot.dataVersion,
            publishedAt: snapshot.publishedAt,
            sourceDate: snapshot.sourceDate,
            cartographyReady: snapshot.cartographyReady,
            etaReady: snapshot.etaReady,
          }),
          document(`adminCatalogDrafts/${snapshot.dataVersion}`, {
            status: 'published',
            checkedAt: snapshot.publishedAt,
            dataVersion: snapshot.dataVersion,
            publishedBy: snapshot.publishedBy,
            validation,
          }),
        ],
      }),
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: { status?: string } } | null;
    throw new Error(`Firestore REST rechazó la publicación (${response.status}${error?.error?.status ? ` ${error.error.status}` : ''}).`);
  }
  return { published: true as const, validation };
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const target = [...args].find((argument) => argument.startsWith('--target='))?.split('=')[1];
  if (target !== 'emulator' && target !== 'production') {
    throw new Error('Usa --target=emulator o --target=production.');
  }
  if (target === 'emulator' && !process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST es obligatorio para impedir escrituras accidentales en producción.');
  }
  if (target === 'production' && !args.has('--confirm-production')) {
    throw new Error('La publicación real requiere --confirm-production y autorización explícita del usuario.');
  }
  if (target === 'production' && (!process.env.GCLOUD_PROJECT || process.env.GCLOUD_PROJECT.startsWith('demo-'))) {
    throw new Error('GCLOUD_PROJECT debe identificar explícitamente el proyecto Firebase real autorizado.');
  }
  const validatedOperationalScenario = args.has('--scenario=validated-operational');
  if (target === 'production' && validatedOperationalScenario && !args.has('--confirm-validated-inputs')) {
    throw new Error('La línea base operativa requiere --confirm-validated-inputs como constancia de aprobación de pesos y despachos.');
  }
  const responsible = process.env.AVANZA_PUBLICATION_RESPONSIBLE
    || (target === 'emulator' ? 'firebase-emulator-suite' : '');
  if (!responsible) {
    throw new Error('AVANZA_PUBLICATION_RESPONSIBLE es obligatorio para una publicación real auditable.');
  }

  const catalogRoutes = validatedOperationalScenario
    ? buildValidatedOperationalRoutes()
    : getAllRoutes();
  const etaReady = validatedOperationalScenario || catalogRoutes.every((route) =>
    ['field', 'validated'].includes(route.travelProfile?.evidence ?? '') &&
    route.service !== null &&
    route.service.dispatchReferenceKind !== 'none' &&
    Number.isFinite(route.service.dispatchReferenceMinute)
  );
  const snapshot: PublishedSnapshot = {
    schemaVersion: 1,
    status: 'published',
    cartographyReady: true,
    etaReady,
    dataVersion: validatedOperationalScenario
      ? VALIDATED_OPERATIONAL_DATA_VERSION
      : ROUTE_CATALOG_METADATA.version,
    source: validatedOperationalScenario
      ? VALIDATED_OPERATIONAL_SOURCE
      : ROUTE_CATALOG_METADATA.source,
    sourceDate: validatedOperationalScenario ? '2026-10-16' : ROUTE_CATALOG_METADATA.sourceDate,
    geometrySourceDate: ROUTE_CATALOG_METADATA.geometrySourceDate,
    decision: validatedOperationalScenario
      ? VALIDATED_OPERATIONAL_DECISION
      : ROUTE_CATALOG_METADATA.decision,
    publishedAt: new Date().toISOString(),
    publishedBy: responsible,
    ...(validatedOperationalScenario ? {
      operationalApproval: {
        status: 'approved' as const,
        approvedAt: '2026-10-16',
        approvedBy: [
          'Responsable del proyecto (confirmación del usuario)',
          'Joshua (validación de la línea base operativa comunicada por el responsable del proyecto)',
        ],
        scope: ['travel_weights', 'dispatch_schedule'] as Array<'travel_weights' | 'dispatch_schedule'>,
        sourceArtifact: 'src/services/official-stops.ts',
        sourceSha256: 'FAD321067D55E5FC04F2158FFBAA0EBE8250188A0BCAF26C17E28861C5F10B32',
      },
    } : {}),
    routes: catalogRoutes.map((route) => ({
      ...route,
      // Los pesos supuestos sirven para pruebas locales, pero nunca se publican
      // como datos operacionales. La geometría puede publicarse por separado.
      travelProfile: etaReady ? route.travelProfile : null,
    })),
  };
  if (target === 'production') {
    const readiness = validateProductionReadiness(snapshot);
    if (!readiness.valid) {
      throw new Error(`Snapshot no apto para producción: ${readiness.issues.map((issue) => issue.code).join(', ')}`);
    }
  }

  const projectId = process.env.GCLOUD_PROJECT || 'demo-avanza-ilo';
  const ephemeralAccessToken = process.env.AVANZA_FIREBASE_ACCESS_TOKEN;
  const result = target === 'production' && ephemeralAccessToken
    ? await publishWithEphemeralAccessToken(projectId, ephemeralAccessToken, snapshot)
    : await (async () => {
        initializeApp({ projectId });
        return publishValidatedSnapshot(getFirestore(), snapshot);
      })();
  if (!result.published) {
    throw new Error(`Snapshot rechazado: ${result.validation.issues.map((issue) => issue.code).join(', ')}`);
  }
  console.log(JSON.stringify({ target, dataVersion: snapshot.dataVersion, validation: result.validation.summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error de publicación no identificado.');
  process.exitCode = 1;
});
