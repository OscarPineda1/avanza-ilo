import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNetwork } from './NetworkContext';
import { fetchPublishedRouteDataset } from '../services/published-catalog';
import { cacheStaticRoutes, getCachedRouteDataset } from '../services/route-cache';

const CatalogContext = createContext({
  routes: [], metadata: null, status: 'loading', source: null, error: null, refresh: async () => {},
});

export function CatalogProvider({ children }) {
  const { availability } = useNetwork();
  const [catalog, setCatalog] = useState({ routes: [], metadata: null, status: 'loading', source: null, error: null });

  const loadCache = useCallback(async (error = null) => {
    const cached = await getCachedRouteDataset();
    setCatalog(cached
      ? { routes: cached.routes, metadata: cached.metadata, status: 'ready', source: 'cache', error }
      : { routes: [], metadata: null, status: 'error', source: null, error: error || 'No existe una caché publicada íntegra.' });
  }, []);

  const refresh = useCallback(async () => {
    if (availability !== 'online') {
      await loadCache(availability === 'no-internet' ? 'La red no tiene acceso utilizable a Internet.' : null);
      return;
    }
    setCatalog((current) => ({ ...current, status: current.routes.length ? 'refreshing' : 'loading', error: null }));
    try {
      const published = await fetchPublishedRouteDataset();
      const saved = await cacheStaticRoutes(published.routes, published.metadata, published.publishedAt);
      if (!saved.saved) throw new Error('published-cache-write-failed');
      setCatalog({ routes: published.routes, metadata: published.metadata, status: 'ready', source: 'firestore', error: null });
    } catch {
      await loadCache('No fue posible actualizar los datos publicados. Se conserva la última copia íntegra.');
    }
  }, [availability, loadCache]);

  useEffect(() => { refresh(); }, [refresh]);
  const value = useMemo(() => ({ ...catalog, refresh }), [catalog, refresh]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
