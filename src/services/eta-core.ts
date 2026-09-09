import { buildGraphFromStops, dijkstra } from './graph';
import { getRouteByName, getRouteSequence } from './routes';

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
  frequencyMinutes?: number,
  sequenceId?: string
): EtaResult {
  const route = getRouteByName(routeName);
  const sequence = getRouteSequence(routeName, sequenceId);
  if (!route || !sequence || sequence.stops.length === 0) {
    return null;
  }

  const originIndex = sequence.stops.findIndex((s) => s.id === originStopId);
  const destinationIndex = sequence.stops.findIndex(
    (s) => s.id === destinationStopId
  );

  if (originIndex === -1 || destinationIndex === -1) {
    return null;
  }

  const graph = buildGraphFromStops(sequence.stops);
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
