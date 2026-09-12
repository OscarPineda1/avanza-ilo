import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Route, RouteCatalogMetadata } from './routes';
import {
  readValidatedRouteDataset,
  saveValidatedRouteDataset,
  type CachedRouteDataset,
  type CacheWriteResult,
} from './route-cache-core';

const STATIC_DATASET_KEY = '@avanza_ilo:published_route_dataset_v4';

export type { CachedRouteDataset, CacheWriteResult } from './route-cache-core';

/**
 * Guarda únicamente un snapshot publicado que ya superó la validación. Una
 * escritura fallida conserva la última copia íntegra bajo la misma clave.
 */
export async function cacheStaticRoutes(
  routes: Route[],
  metadata: RouteCatalogMetadata,
  validatedAt?: string
): Promise<CacheWriteResult> {
  return saveValidatedRouteDataset(
    AsyncStorage,
    STATIC_DATASET_KEY,
    routes,
    metadata,
    validatedAt
  );
}

export async function getCachedRouteDataset(): Promise<CachedRouteDataset | null> {
  return readValidatedRouteDataset(AsyncStorage, STATIC_DATASET_KEY);
}
