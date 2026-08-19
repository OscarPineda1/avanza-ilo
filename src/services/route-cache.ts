import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Route } from './routes';

const STATIC_DATASET_KEY = '@avanza_ilo:static_dataset_v1';

export type CachedRouteDataset = {
  cachedAt: string;
  routes: Route[];
};

/**
 * Keeps the master data required by offline mode on-device. The app continues
 * using the bundled dataset if the cache cannot be read or written.
 */
export async function cacheStaticRoutes(routes: Route[]): Promise<void> {
  const dataset: CachedRouteDataset = {
    cachedAt: new Date().toISOString(),
    routes,
  };

  try {
    await AsyncStorage.setItem(STATIC_DATASET_KEY, JSON.stringify(dataset));
  } catch {
    // Offline mode still has the bundled route data as a safe fallback.
  }
}

export async function getCachedRouteDataset(): Promise<CachedRouteDataset | null> {
  try {
    const raw = await AsyncStorage.getItem(STATIC_DATASET_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedRouteDataset;
    return Array.isArray(parsed.routes) ? parsed : null;
  } catch {
    return null;
  }
}
