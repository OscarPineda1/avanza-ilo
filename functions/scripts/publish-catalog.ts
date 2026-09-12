import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAllRoutes, ROUTE_CATALOG_METADATA } from '../../src/services/routes';
import type { PublishedSnapshot } from '../src/contracts';
import { publishValidatedSnapshot } from '../src/publication';

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
  const responsible = process.env.AVANZA_PUBLICATION_RESPONSIBLE
    || (target === 'emulator' ? 'firebase-emulator-suite' : '');
  if (!responsible) {
    throw new Error('AVANZA_PUBLICATION_RESPONSIBLE es obligatorio para una publicación real auditable.');
  }

  initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-avanza-ilo' });
  const firestore = getFirestore();
  const snapshot: PublishedSnapshot = {
    schemaVersion: 1,
    status: 'published',
    dataVersion: ROUTE_CATALOG_METADATA.version,
    source: ROUTE_CATALOG_METADATA.source,
    sourceDate: ROUTE_CATALOG_METADATA.sourceDate,
    geometrySourceDate: ROUTE_CATALOG_METADATA.geometrySourceDate,
    decision: ROUTE_CATALOG_METADATA.decision,
    publishedAt: new Date().toISOString(),
    publishedBy: responsible,
    routes: getAllRoutes(),
  };
  const result = await publishValidatedSnapshot(firestore, snapshot);
  if (!result.published) {
    throw new Error(`Snapshot rechazado: ${result.validation.issues.map((issue) => issue.code).join(', ')}`);
  }
  console.log(JSON.stringify({ target, dataVersion: snapshot.dataVersion, validation: result.validation.summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error de publicación no identificado.');
  process.exitCode = 1;
});
