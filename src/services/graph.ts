import { LatLng } from './routes';
import { Stop } from './stops';
import { haversineDistance } from './haversine';

export type Edge = {
  from: number;
  to: number;
  weight: number; // seconds
  distance: number; // meters
};

export type Graph = {
  nodes: LatLng[];
  stopIndexes: number[];
  adjacency: Edge[];
};

// AVERAGE_BUS_SPEED meters/second (~25 km/h)
const AVERAGE_BUS_SPEED_MS = 25 * 1000 / 3600;

export function buildGraphFromStops(stops: Stop[]): Graph {
  const nodes = stops.map((s) => s.coordinate);
  const stopIndexes = stops.map((_, i) => i);
  const adjacency: Edge[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const distance = haversineDistance(nodes[i], nodes[i + 1]);
    const weight = distance / AVERAGE_BUS_SPEED_MS;
    adjacency.push({ from: i, to: i + 1, weight, distance });
    // Assumes route can be traversed in both directions for manual origin flexibility.
    adjacency.push({ from: i + 1, to: i, weight, distance });
  }

  return { nodes, stopIndexes, adjacency };
}

export function dijkstra(graph: Graph, originIndex: number): number[] {
  const nodeCount = graph.nodes.length;
  const distances = new Array<number>(nodeCount).fill(Infinity);
  const visited = new Array<boolean>(nodeCount).fill(false);

  distances[originIndex] = 0;

  const adjacencyList = new Array<Array<{ to: number; weight: number }>>(
    nodeCount
  );
  for (let i = 0; i < nodeCount; i++) {
    adjacencyList[i] = [];
  }
  for (const edge of graph.adjacency) {
    adjacencyList[edge.from].push({ to: edge.to, weight: edge.weight });
  }

  for (let i = 0; i < nodeCount; i++) {
    let u = -1;
    for (let j = 0; j < nodeCount; j++) {
      if (!visited[j] && (u === -1 || distances[j] < distances[u])) {
        u = j;
      }
    }

    if (u === -1 || distances[u] === Infinity) {
      break;
    }

    visited[u] = true;

    for (const neighbor of adjacencyList[u]) {
      const alt = distances[u] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
      }
    }
  }

  return distances;
}
