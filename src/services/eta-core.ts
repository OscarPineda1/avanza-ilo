import { buildGraphFromStops, dijkstra } from './graph';
import { getRouteByName } from './routes';

export type EtaResult = {
  minutes: number;
} | null;

export function parseFrequencyMinutes(
  frecuencia: string | undefined
): number | undefined {
  if (!frecuencia) return undefined;
  const match = frecuencia.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

export function computeEta(
  routeName: string,
  originStopId: string,
  destinationStopId: string,
  frequencyMinutes?: number
): EtaResult {
  const route = getRouteByName(routeName);
  if (!route || !route.stops || route.stops.length === 0) {
    return null;
  }

  const originIndex = route.stops.findIndex((s) => s.id === originStopId);
  const destinationIndex = route.stops.findIndex(
    (s) => s.id === destinationStopId
  );

  if (originIndex === -1 || destinationIndex === -1) {
    return null;
  }

  const graph = buildGraphFromStops(route.stops);
  const distances = dijkstra(graph, originIndex);
  const seconds = distances[destinationIndex];

  if (!Number.isFinite(seconds)) {
    return null;
  }

  const travelMinutes = Math.max(0, Math.round(seconds / 60));
  const freq = frequencyMinutes ?? parseFrequencyMinutes(route.frecuencia) ?? 0;
  // Average expected wait time is half the dispatch interval.
  const waitMinutes = freq > 0 ? Math.floor(freq / 2) : 0;
  const minutes = Math.max(1, travelMinutes + waitMinutes);

  return { minutes };
}
