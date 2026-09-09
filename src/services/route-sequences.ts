import { haversineDistance } from './haversine';
import { buildStops, type Stop } from './stops';
import type { LatLng } from './routes';

export type RouteLayer = {
  id: string;
  sourceName: string;
  order: number;
  coordinates: LatLng[];
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

export function flattenRouteLayers(layers: RouteLayer[]): LatLng[] {
  return [...layers]
    .sort((left, right) => left.order - right.order)
    .flatMap((layer) => layer.coordinates);
}

export function createRouteSequence(
  routeName: string,
  referenceCount: number,
  definition: Omit<RouteSequence, 'coordinates' | 'stops'>
): RouteSequence {
  const coordinates = flattenRouteLayers(definition.layers);

  return {
    ...definition,
    coordinates,
    stops: buildStops(routeName, definition.id, coordinates, referenceCount),
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
