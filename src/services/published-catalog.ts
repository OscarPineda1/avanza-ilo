import { doc, getDoc } from 'firebase/firestore';
import { getPublicFirestore } from './firebase';
import { validateRouteCatalog } from './route-catalog-validation';
import type { Route, RouteCatalogMetadata } from './routes';

export type PublishedRouteDataset = {
  routes: Route[];
  metadata: RouteCatalogMetadata;
  publishedAt: string;
};

export async function fetchPublishedRouteDataset(): Promise<PublishedRouteDataset> {
  const firestore = getPublicFirestore();
  const currentDocument = await getDoc(doc(firestore, 'publication', 'current'));
  if (!currentDocument.exists()) throw new Error('published-version-unavailable');
  const current = currentDocument.data();
  if (typeof current.dataVersion !== 'string' || !current.dataVersion) {
    throw new Error('published-version-invalid');
  }
  const snapshotDocument = await getDoc(doc(firestore, 'publishedSnapshots', current.dataVersion));
  if (!snapshotDocument.exists()) throw new Error('published-snapshot-unavailable');
  const snapshot = snapshotDocument.data();
  if (
    snapshot.status !== 'published' ||
    snapshot.cartographyReady !== true ||
    typeof snapshot.etaReady !== 'boolean' ||
    snapshot.dataVersion !== current.dataVersion ||
    typeof snapshot.publishedAt !== 'string' ||
    Number.isNaN(Date.parse(snapshot.publishedAt)) ||
    !Array.isArray(snapshot.routes)
  ) throw new Error('published-snapshot-inconsistent');
  const metadata: RouteCatalogMetadata = {
    id: 'avanza-ilo-rutas-piloto',
    version: snapshot.dataVersion,
    source: snapshot.source,
    sourceDate: snapshot.sourceDate,
    geometrySourceDate: snapshot.geometrySourceDate,
    approvedPilotRouteNames: ['1A', 'D', '14'],
    decision: snapshot.decision,
    cartographyReady: snapshot.cartographyReady,
    etaReady: snapshot.etaReady,
  };
  const validation = validateRouteCatalog(snapshot.routes as Route[], metadata);
  if (!validation.valid) throw new Error('published-snapshot-validation-failed');
  return {
    routes: snapshot.routes as Route[],
    metadata,
    publishedAt: snapshot.publishedAt,
  };
}
