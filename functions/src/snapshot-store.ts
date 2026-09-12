import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { PublishedSnapshot } from './contracts.js';

type CacheEntry = { expiresAt: number; snapshot: PublishedSnapshot };
let cache: CacheEntry | null = null;

export async function readActiveSnapshot(
  firestore: Firestore = getFirestore(),
  nowMilliseconds = Date.now()
): Promise<PublishedSnapshot> {
  const current = await firestore.doc('publication/current').get();
  const dataVersion = current.get('dataVersion');
  if (typeof dataVersion !== 'string' || !dataVersion) {
    throw new Error('published-version-unavailable');
  }
  if (cache && cache.snapshot.dataVersion === dataVersion && cache.expiresAt > nowMilliseconds) {
    return cache.snapshot;
  }
  const document = await firestore.doc(`publishedSnapshots/${dataVersion}`).get();
  if (!document.exists) throw new Error('published-snapshot-unavailable');
  const snapshot = document.data() as PublishedSnapshot;
  if (snapshot.dataVersion !== dataVersion || snapshot.status !== 'published') {
    throw new Error('published-snapshot-inconsistent');
  }
  cache = { snapshot, expiresAt: nowMilliseconds + 60_000 };
  return snapshot;
}

export function clearSnapshotCache(): void {
  cache = null;
}
