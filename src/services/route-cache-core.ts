import {
  validateRouteCatalog,
  type CatalogValidationResult,
} from './route-catalog-validation';
import type { Route, RouteCatalogMetadata } from './routes';

export type RouteDatasetStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export type CachedRouteDataset = {
  validatedAt: string;
  metadata: RouteCatalogMetadata;
  routes: Route[];
};

export type CacheWriteResult = {
  saved: boolean;
  validation: CatalogValidationResult;
};

export async function saveValidatedRouteDataset(
  storage: RouteDatasetStorage,
  key: string,
  routes: Route[],
  metadata: RouteCatalogMetadata,
  validatedAt = new Date().toISOString()
): Promise<CacheWriteResult> {
  const validation = validateRouteCatalog(routes, metadata);

  if (!validation.valid) {
    return { saved: false, validation };
  }

  const dataset: CachedRouteDataset = {
    validatedAt,
    metadata,
    routes,
  };

  try {
    await storage.setItem(key, JSON.stringify(dataset));
    return { saved: true, validation };
  } catch {
    return { saved: false, validation };
  }
}

export async function readValidatedRouteDataset(
  storage: RouteDatasetStorage,
  key: string
): Promise<CachedRouteDataset | null> {
  try {
    const raw = await storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedRouteDataset;
    if (
      !Array.isArray(parsed.routes) ||
      !parsed.metadata ||
      typeof parsed.validatedAt !== 'string'
    ) {
      return null;
    }

    const validation = validateRouteCatalog(parsed.routes, parsed.metadata);
    return validation.valid ? parsed : null;
  } catch {
    return null;
  }
}
