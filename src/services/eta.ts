import { buildGraphFromStops, dijkstra } from './graph';
import { getRouteByName } from './routes';

export type EtaResult = {
  minutes: number;
} | null;

export async function getEta(
  routeName: string,
  originStopId: string,
  destinationStopId: string
): Promise<EtaResult> {
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

  // In a real deployment this would be an async HTTPS call to the backend.
  // Here we compute locally in the same shape to keep the UI contract intact.
  const graph = buildGraphFromStops(route.stops);
  const distances = dijkstra(graph, originIndex);
  const seconds = distances[destinationIndex];

  if (!Number.isFinite(seconds)) {
    return null;
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  return { minutes };
}
