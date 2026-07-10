import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { computeEta } from '../../src/services/eta-core';
import { getRouteByName } from '../../src/services/routes';

initializeApp();

function parseFrequencyMinutes(frecuencia: string | undefined): number | undefined {
  if (!frecuencia) return undefined;
  const match = frecuencia.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

async function getFrequencyMinutes(routeName: string): Promise<number | undefined> {
  const db = getFirestore();
  try {
    const doc = await db.collection('frequencies').doc(routeName).get();
    if (doc.exists) {
      const data = doc.data();
      if (typeof data?.minutes === 'number') {
        return data.minutes;
      }
    }
  } catch (error) {
    // Firestore is optional; fall back to the static route registry.
    console.warn(`Firestore read failed for frequency/${routeName}:`, error);
  }

  return parseFrequencyMinutes(getRouteByName(routeName)?.frecuencia);
}

export const getEta = onCall(async (request) => {
  const { routeName, originStopId, destinationStopId } = (request.data || {}) as {
    routeName?: string;
    originStopId?: string;
    destinationStopId?: string;
  };

  if (!routeName || !originStopId || !destinationStopId) {
    throw new HttpsError(
      'invalid-argument',
      'routeName, originStopId and destinationStopId are required'
    );
  }

  const frequencyMinutes = await getFrequencyMinutes(routeName);
  const result = computeEta(routeName, originStopId, destinationStopId, frequencyMinutes);

  if (!result) {
    throw new HttpsError('not-found', 'Could not compute ETA for the given route');
  }

  return result;
});

export const getFrequency = onCall(async (request) => {
  const { routeName } = (request.data || {}) as { routeName?: string };

  if (!routeName) {
    throw new HttpsError('invalid-argument', 'routeName is required');
  }

  const minutes = await getFrequencyMinutes(routeName);
  if (typeof minutes !== 'number') {
    throw new HttpsError('not-found', `No frequency data found for ${routeName}`);
  }

  return { minutes, text: `${minutes} min` };
});
