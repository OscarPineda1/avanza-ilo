import type { LatLng } from './routes';
import { haversineDistance } from './haversine';

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
  const cumulativeMeters = new Array<number>(total).fill(0);
  for (let index = 1; index < total; index += 1) {
    cumulativeMeters[index] =
      cumulativeMeters[index - 1] +
      haversineDistance(coordinates[index - 1], coordinates[index]);
  }

  const locationName = (coordinateIndex: number, isOrigin: boolean, isDestination: boolean) => {
    if (isOrigin) return `Inicio · Ruta ${routeName}`;
    if (isDestination) return `Final · Ruta ${routeName}`;
    return `Ruta ${routeName} · km ${(cumulativeMeters[coordinateIndex] / 1000).toFixed(1)}`;
  };

  for (let i = 0; i < total; i += step) {
    const coordinate = coordinates[i];
    const isOrigin = result.length === 0;
    const isDestination = i + step >= total;
    result.push({
      id: `${sequenceId.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      sequenceId,
      name: locationName(i, isOrigin, isDestination),
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
    lastStop.name = locationName(lastStop.coordinateIndex, false, false);
    result.push({
      id: `${sequenceId.toLowerCase()}-stop-${result.length + 1}`,
      routeName,
      sequenceId,
      name: locationName(total - 1, false, true),
      coordinate: last,
      isOrigin: false,
      isDestination: true,
      order: result.length,
      coordinateIndex: total - 1,
    });
  }

  return result;
}
