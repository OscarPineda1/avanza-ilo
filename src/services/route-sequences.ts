import { haversineDistance } from './haversine';
import { buildStops, type Stop } from './stops';
import type { LatLng } from './routes';

export type RouteLayer = {
  id: string;
  sourceName: string;
  order: number;
  coordinates: LatLng[];
  visible?: boolean;
};

export type RouteSequenceKind = 'direction' | 'circuit';

export type RouteSequence = {
  id: string;
  label: string;
  kind: RouteSequenceKind;
  layers: RouteLayer[];
  coordinates: LatLng[];
  stops: Stop[];
};

export const MAX_LAYER_JOIN_DISTANCE_METERS = 50;
const displayGeometryCache = new WeakMap<LatLng[], LatLng[]>();

export function flattenRouteLayers(layers: RouteLayer[]): LatLng[] {
  return [...layers]
    .sort((left, right) => left.order - right.order)
    .flatMap((layer) => layer.coordinates);
}

export function getDisplayCoordinates(coordinates: LatLng[]): LatLng[] {
  const cached = displayGeometryCache.get(coordinates);
  if (cached) return cached;
  if (coordinates.length < 3) return coordinates;

  const result = [coordinates[0]];
  for (let index = 1; index < coordinates.length - 1; index += 1) {
    if (haversineDistance(result.at(-1)!, coordinates[index]) >= 7) {
      result.push(coordinates[index]);
    }
  }
  result.push(coordinates.at(-1)!);
  displayGeometryCache.set(coordinates, result);
  return result;
}

export function createRouteSequence(
  routeName: string,
  referenceCount: number,
  definition: Omit<RouteSequence, 'coordinates' | 'stops'>
): RouteSequence {
  const coordinates = flattenRouteLayers(definition.layers);
  const stops = buildStops(routeName, definition.id, coordinates, referenceCount);

  if (definition.kind === 'circuit' && stops.length > 1) {
    stops[0].name = `Inicio y fin · Ruta ${routeName}`;
    stops.at(-1)!.name = `Cierre · Ruta ${routeName}`;
  }

  return {
    ...definition,
    coordinates,
    stops,
  };
}

export function getLayerJoinDistance(
  current: RouteLayer,
  next: RouteLayer
): number {
  const currentEnd = current.coordinates.at(-1);
  const nextStart = next.coordinates[0];

  if (!currentEnd || !nextStart) return Infinity;
  return haversineDistance(currentEnd, nextStart);
}
