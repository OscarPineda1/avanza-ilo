import type { Route } from './routes';

export function normalizeRouteQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function searchRoutes(routes: Route[], query: string): Route[] {
  const normalizedQuery = normalizeRouteQuery(query);
  if (!normalizedQuery) return routes;

  return routes.filter((route) => normalizeRouteQuery([
    route.nombre,
    route.descripcion,
    route.empresa,
    route.origen,
    route.destino,
    route.zona,
  ].join(' ')).includes(normalizedQuery));
}
