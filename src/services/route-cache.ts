import AsyncStorage from '@react-native-async-storage/async-storage';

import { ROUTE_CATALOG_METADATA } from './routes';
import type { Route, RouteCatalogMetadata } from './routes';
import {
  readValidatedRouteDataset,
  saveValidatedRouteDataset,
  type CachedRouteDataset,
  type CacheWriteResult,
} from './route-cache-core';

const STATIC_DATASET_KEY = '@avanza_ilo:validated_route_dataset_v3';

export type { CachedRouteDataset, CacheWriteResult } from './route-cache-core';

/**
 * Keeps the master data required by offline mode on-device. The app continues
 * using the bundled dataset if the cache cannot be read or written.
 */
export async function cacheStaticRoutes(
  routes: Route[],
  metadata: RouteCatalogMetadata = ROUTE_CATALOG_METADATA
): Promise<CacheWriteResult> {
  return saveValidatedRouteDataset(
    AsyncStorage,
    STATIC_DATASET_KEY,
    routes,
    metadata
  );
}

export async function getCachedRouteDataset(): Promise<CachedRouteDataset | null> {
  return readValidatedRouteDataset(AsyncStorage, STATIC_DATASET_KEY);
}
