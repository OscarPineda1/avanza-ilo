import { haversineDistance } from './haversine';
import type { LatLng } from './routes';
import type { Stop } from './stops';

export type TravelTimeProfile = {
  id: string;
  band: string;
  averageSpeedKmh: number;
  stopPenaltyMinutes: number;
  source: string;
  sourceDate: string;
  evidence: 'field' | 'synthetic' | 'assumption';
  weightUnit: 'seconds';
};

export type Edge = {
  from: number;
  to: number;
  weight: number; // seconds
  distance: number; // meters
};

export type Graph = {
  routeName?: string;
  sequenceId?: string;
  nodes: LatLng[];
  stopIndexes: number[];
  adjacency: Edge[];
  weightUnit: 'seconds';
  profileId: string;
};

export type ShortestPathResult = {
  distance: number;
  path: number[];
};

export const BASELINE_TRAVEL_PROFILE: TravelTimeProfile = {
  id: 'ilo-dia-base-v1',
  band: 'día completo',
  averageSpeedKmh: 25,
  stopPenaltyMinutes: 0,
  source: 'Supuesto técnico provisional; pendiente de calibración manual HU-18',
  sourceDate: '2026-09-09',
  evidence: 'assumption',
  weightUnit: 'seconds',
};

function assertProfile(profile: TravelTimeProfile): void {
  if (
    !Number.isFinite(profile.averageSpeedKmh) ||
    profile.averageSpeedKmh <= 0 ||
    !Number.isFinite(profile.stopPenaltyMinutes) ||
    profile.stopPenaltyMinutes < 0
  ) {
    throw new Error('El perfil de tiempos debe usar velocidad positiva y penalidad no negativa.');
  }
}

function edgeWeightSeconds(
  distanceMeters: number,
  profile: TravelTimeProfile,
  reachesStop: boolean
): number {
  const metersPerSecond = (profile.averageSpeedKmh * 1000) / 3600;
  const stopPenaltySeconds = reachesStop ? profile.stopPenaltyMinutes * 60 : 0;
  return distanceMeters / metersPerSecond + stopPenaltySeconds;
}

export function buildDirectedRouteGraph(
  coordinates: LatLng[],
  routeName: string,
  sequenceId: string,
  profile: TravelTimeProfile = BASELINE_TRAVEL_PROFILE,
  stopIndexes: number[] = []
): Graph {
  assertProfile(profile);
  if (coordinates.length < 2) {
    throw new Error('El grafo dirigido necesita al menos dos posiciones ordenadas.');
  }

  const adjacency: Edge[] = [];
  const stopIndexSet = new Set(stopIndexes);
  for (let index = 0; index < coordinates.length - 1; index += 1) {
    const distance = haversineDistance(coordinates[index], coordinates[index + 1]);
    const weight = edgeWeightSeconds(distance, profile, stopIndexSet.has(index + 1));
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(weight) || weight < 0) {
      throw new Error(`El segmento ${index}-${index + 1} tiene un peso inválido.`);
    }
    adjacency.push({ from: index, to: index + 1, distance, weight });
  }

  return {
    routeName,
    sequenceId,
    nodes: coordinates,
    stopIndexes,
    adjacency,
    weightUnit: 'seconds',
    profileId: profile.id,
  };
}

export function buildGraphFromStops(
  stops: Stop[],
  profile: TravelTimeProfile = BASELINE_TRAVEL_PROFILE
): Graph {
  const routeName = stops[0]?.routeName;
  const sequenceId = stops[0]?.sequenceId;

  if (
    !routeName ||
    !sequenceId ||
    stops.some(
      (stop) =>
        stop.routeName !== routeName || stop.sequenceId !== sequenceId
    )
  ) {
    throw new Error(
      'El grafo solo puede construirse con paradas de una misma ruta y secuencia.'
    );
  }

  return buildDirectedRouteGraph(
    stops.map((stop) => stop.coordinate),
    routeName,
    sequenceId,
    profile,
    stops.map((stop) => stop.coordinateIndex)
  );
}

export function dijkstra(graph: Graph, originIndex: number): number[] {
  if (!Number.isInteger(originIndex) || originIndex < 0 || originIndex >= graph.nodes.length) {
    throw new Error('El nodo de origen no existe en el grafo.');
  }
  return runDijkstra(graph, originIndex).distances;
}

type QueueEntry = { node: number; distance: number };

function pushQueue(queue: QueueEntry[], entry: QueueEntry): void {
  queue.push(entry);
  let index = queue.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (queue[parent].distance <= queue[index].distance) break;
    [queue[parent], queue[index]] = [queue[index], queue[parent]];
    index = parent;
  }
}

function popQueue(queue: QueueEntry[]): QueueEntry | undefined {
  const first = queue[0];
  const last = queue.pop();
  if (!first || !last || queue.length === 0) return first;
  queue[0] = last;
  let index = 0;
  while (true) {
    const left = index * 2 + 1;
    const right = left + 1;
    let smallest = index;
    if (left < queue.length && queue[left].distance < queue[smallest].distance) smallest = left;
    if (right < queue.length && queue[right].distance < queue[smallest].distance) smallest = right;
    if (smallest === index) break;
    [queue[index], queue[smallest]] = [queue[smallest], queue[index]];
    index = smallest;
  }
  return first;
}

function runDijkstra(graph: Graph, originIndex: number) {
  const adjacency = Array.from({ length: graph.nodes.length }, () => [] as Edge[]);
  for (const edge of graph.adjacency) {
    if (
      edge.from < 0 || edge.from >= graph.nodes.length ||
      edge.to < 0 || edge.to >= graph.nodes.length ||
      !Number.isFinite(edge.weight) || edge.weight < 0
    ) {
      throw new Error('El grafo contiene una arista o peso inválido.');
    }
    adjacency[edge.from].push(edge);
  }

  const distances = new Array<number>(graph.nodes.length).fill(Infinity);
  const previous = new Array<number>(graph.nodes.length).fill(-1);
  const queue: QueueEntry[] = [];
  distances[originIndex] = 0;
  pushQueue(queue, { node: originIndex, distance: 0 });

  while (queue.length > 0) {
    const current = popQueue(queue)!;
    if (current.distance !== distances[current.node]) continue;
    for (const edge of adjacency[current.node]) {
      const candidate = current.distance + edge.weight;
      if (candidate >= distances[edge.to]) continue;
      distances[edge.to] = candidate;
      previous[edge.to] = current.node;
      pushQueue(queue, { node: edge.to, distance: candidate });
    }
  }

  return { distances, previous };
}

export function shortestPath(
  graph: Graph,
  originIndex: number,
  destinationIndex: number
): ShortestPathResult | null {
  if (!Number.isInteger(originIndex) || originIndex < 0 || originIndex >= graph.nodes.length) {
    throw new Error('El nodo de origen no existe en el grafo.');
  }
  if (!Number.isInteger(destinationIndex) || destinationIndex < 0 || destinationIndex >= graph.nodes.length) {
    throw new Error('El nodo de destino no existe en el grafo.');
  }
  if (originIndex === destinationIndex) return { distance: 0, path: [originIndex] };

  const { distances, previous } = runDijkstra(graph, originIndex);
  if (!Number.isFinite(distances[destinationIndex])) return null;

  const path: number[] = [];
  for (let node = destinationIndex; node !== -1; node = previous[node]) {
    path.push(node);
    if (node === originIndex) break;
  }
  path.reverse();

  return {
    distance: distances[destinationIndex],
    path,
  };
}
