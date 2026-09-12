import type { Firestore } from 'firebase-admin/firestore';
import type { PublishedSnapshot } from './contracts.js';
import { validatePublishedSnapshot } from './snapshot-validator.js';

export async function publishValidatedSnapshot(
  firestore: Firestore,
  snapshot: PublishedSnapshot
) {
  const validation = validatePublishedSnapshot(snapshot);
  if (!validation.valid) {
    await firestore.doc(`adminCatalogDrafts/${snapshot.dataVersion || 'invalid'}`).set({
      status: 'rejected',
      checkedAt: new Date().toISOString(),
      dataVersion: snapshot.dataVersion || null,
      validation,
    });
    return { published: false as const, validation };
  }

  await firestore.runTransaction(async (transaction) => {
    transaction.set(firestore.doc(`publishedSnapshots/${snapshot.dataVersion}`), snapshot);
    transaction.set(firestore.doc('publication/current'), {
      dataVersion: snapshot.dataVersion,
      publishedAt: snapshot.publishedAt,
      sourceDate: snapshot.sourceDate,
    });
    transaction.set(firestore.doc(`adminCatalogDrafts/${snapshot.dataVersion}`), {
      status: 'published',
      checkedAt: snapshot.publishedAt,
      dataVersion: snapshot.dataVersion,
      validation,
    });
  });

  return { published: true as const, validation };
}
