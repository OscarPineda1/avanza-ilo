import type { LatLng } from './routes';
import type { RouteSequence } from './route-sequences';
import type { Stop } from './stops';

export type RoutePosition = {
  id: string;
  routeName: string;
  sequenceId: string;
  name: string;
  coordinate: LatLng;
  segmentIndex: number;
  fraction: number;
  layerId: string;
  passageLabel: string;
  source: 'reference' | 'map';
};

type ProjectedPosition = RoutePosition & { distanceMeters: number };

const METERS_PER_LATITUDE_DEGREE = 111_320;

function projectOnSegment(point: LatLng, from: LatLng, to: LatLng) {
  const longitudeScale = Math.cos((point.latitude * Math.PI) / 180) * METERS_PER_LATITUDE_DEGREE;
  const ax = (from.longitude - point.longitude) * longitudeScale;
  const ay = (from.latitude - point.latitude) * METERS_PER_LATITUDE_DEGREE;
  const bx = (to.longitude - point.longitude) * longitudeScale;
  const by = (to.latitude - point.latitude) * METERS_PER_LATITUDE_DEGREE;
  const dx = bx - ax;
  const dy = by - ay;
  const denominator = dx * dx + dy * dy;
  const fraction = denominator === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / denominator));
  const x = ax + dx * fraction;
  const y = ay + dy * fraction;

  return {
    fraction,
    distanceMeters: Math.hypot(x, y),
    coordinate: {
      latitude: from.latitude + (to.latitude - from.latitude) * fraction,
      longitude: from.longitude + (to.longitude - from.longitude) * fraction,
    },
  };
}

function getLayerAtSegment(sequence: RouteSequence, segmentIndex: number) {
  let offset = 0;
  for (const layer of [...sequence.layers].sort((left, right) => left.order - right.order)) {
    const end = offset + layer.coordinates.length - 1;
    if (segmentIndex <= end) return layer;
    offset += layer.coordinates.length;
  }
  return sequence.layers.at(-1)!;
}

function passageLabel(layerId: string): string {
  return /retorno/i.test(layerId) ? 'Tramo de regreso' : 'Tramo de ida';
}

export function positionFromStop(stop: Stop, sequence: RouteSequence): RoutePosition {
  const segmentIndex = Math.min(stop.coordinateIndex, sequence.coordinates.length - 2);
  const fraction = stop.coordinateIndex >= sequence.coordinates.length - 1 ? 1 : 0;
  const layer = getLayerAtSegment(sequence, segmentIndex);
  return {
    id: stop.id,
    routeName: stop.routeName,
    sequenceId: stop.sequenceId,
    name: stop.name,
    coordinate: stop.coordinate,
    segmentIndex,
    fraction,
    layerId: layer.id,
    passageLabel: passageLabel(layer.id),
    source: 'reference',
  };
}

export function findRoutePositionCandidates(
  routeName: string,
  sequence: RouteSequence,
  point: LatLng,
  maximumDistanceMeters = 45
): RoutePosition[] {
  const projections: ProjectedPosition[] = [];
  for (let segmentIndex = 0; segmentIndex < sequence.coordinates.length - 1; segmentIndex += 1) {
    const projected = projectOnSegment(
      point,
      sequence.coordinates[segmentIndex],
      sequence.coordinates[segmentIndex + 1]
    );
    if (projected.distanceMeters > maximumDistanceMeters) continue;
    const layer = getLayerAtSegment(sequence, segmentIndex);
    projections.push({
      id: `${sequence.id}-map-${segmentIndex}-${Math.round(projected.fraction * 100)}`,
      routeName,
      sequenceId: sequence.id,
      name: 'Punto elegido sobre la ruta',
      coordinate: projected.coordinate,
      segmentIndex,
      fraction: projected.fraction,
      layerId: layer.id,
      passageLabel: passageLabel(layer.id),
      source: 'map',
      distanceMeters: projected.distanceMeters,
    });
  }

  projections.sort((left, right) => left.distanceMeters - right.distanceMeters);
  const candidates: ProjectedPosition[] = [];
  for (const candidate of projections) {
    if (candidates.some((current) => Math.abs(current.segmentIndex - candidate.segmentIndex) < 16)) continue;
    if (candidates.length > 0 && candidate.distanceMeters > candidates[0].distanceMeters + 8) break;
    candidates.push(candidate);
    if (candidates.length === 2) break;
  }

  return candidates.map(({ distanceMeters: _distanceMeters, ...candidate }) => candidate);
}
