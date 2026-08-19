import { getFunctions, httpsCallable } from 'firebase/functions';

import { fetchRouteFrequency, getFirebaseApp } from './firebase';
import { computeEta, EtaResult } from './eta-core';

export type { EtaResult } from './eta-core';
export { computeEta } from './eta-core';

const cloudFunctionsEnabled =
  process.env.EXPO_PUBLIC_ENABLE_CLOUD_FUNCTIONS === 'true';

export async function getEta(
  routeName: string,
  originStopId: string,
  destinationStopId: string
): Promise<EtaResult> {
  const firebaseApp = getFirebaseApp();
  if (cloudFunctionsEnabled && firebaseApp) {
    try {
      const functions = getFunctions(firebaseApp);
      const callGetEta = httpsCallable(functions, 'getEta');
      const response = await callGetEta({
        routeName,
        originStopId,
        destinationStopId,
      });
      const data = response.data as EtaResult;
      if (data && typeof data.minutes === 'number') {
        return data;
      }
    } catch {
      // If the cloud function is not available, fall back to the local engine.
    }
  }

  return computeEta(routeName, originStopId, destinationStopId);
}

export async function getRemoteFrequency(
  routeName: string
): Promise<number | null> {
  const firestoreFrequency = await fetchRouteFrequency(routeName);
  if (typeof firestoreFrequency === 'number') {
    return firestoreFrequency;
  }

  if (!cloudFunctionsEnabled) {
    return null;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    const functions = getFunctions(firebaseApp);
    const callGetFrequency = httpsCallable(functions, 'getFrequency');
    const response = await callGetFrequency({ routeName });
    const data = response.data as { minutes?: number } | null;
    if (data && typeof data.minutes === 'number') {
      return data.minutes;
    }
  } catch {
    // Fallback to local data is handled by callers.
  }

  return null;
}
