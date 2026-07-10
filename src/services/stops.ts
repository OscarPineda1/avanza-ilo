import { LatLng } from './routes';

export type Stop = {
  id: string;
  routeName: string;
  name: string;
  coordinate: LatLng;
  isOrigin: boolean;
  isDestination: boolean;
  order: number;
};

export function buildStops(
  routeName: string,
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
      id: `${routeName.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      name: isOrigin
        ? `Paradero Inicial`
        : isDestination
        ? `Paradero Final`
        : `Paradero ${result.length + 1}`,
      coordinate,
      isOrigin,
      isDestination,
      order: result.length,
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
    lastStop.name = `Paradero ${result.length}`;
    result.push({
      id: `${routeName.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      name: 'Paradero Final',
      coordinate: last,
      isOrigin: false,
      isDestination: true,
      order: result.length,
    });
  }

  return result;
}
