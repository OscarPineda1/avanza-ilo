import type { LatLng } from './routes';

export type Stop = {
  id: string;
  routeName: string;
  sequenceId: string;
  name: string;
  coordinate: LatLng;
  isOrigin: boolean;
  isDestination: boolean;
  order: number;
  coordinateIndex: number;
};

export function buildStops(
  routeName: string,
  sequenceId: string,
  coordinates: LatLng[] | null,
  count: number
): Stop[] {
  if (!coordinates || coordinates.length === 0) {
    return [];
  }

  const total = coordinates.length;
  const step = Math.max(1, Math.floor((total - 1) / (count - 1)));
  const result: Stop[] = [];

  for (let i = 0; i < total; i += step) {
    const coordinate = coordinates[i];
    const isOrigin = result.length === 0;
    const isDestination = i + step >= total;
    result.push({
      id: `${sequenceId.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      sequenceId,
      name: isOrigin
        ? 'Punto de referencia inicial'
        : isDestination
        ? 'Punto de referencia final'
        : `Punto de referencia ${result.length + 1}`,
      coordinate,
      isOrigin,
      isDestination,
      order: result.length,
      coordinateIndex: i,
    });
    if (isDestination) {
      break;
    }
  }

  // Ensure the last point is always included as destination.
  const last = coordinates[total - 1];
  const lastStop = result[result.length - 1];
  if (
    lastStop &&
    (lastStop.coordinate.latitude !== last.latitude ||
      lastStop.coordinate.longitude !== last.longitude)
  ) {
    // The previous sampled stop was incorrectly marked as the destination.
    lastStop.isDestination = false;
    lastStop.name = `Punto de referencia ${result.length}`;
    result.push({
      id: `${sequenceId.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      sequenceId,
      name: 'Punto de referencia final',
      coordinate: last,
      isOrigin: false,
      isDestination: true,
      order: result.length,
      coordinateIndex: total - 1,
    });
  }

  return result;
}
