import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllRoutes,
  ROUTE_CATALOG_METADATA,
  type Route,
} from '../src/services/routes';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';
import { buildDirectedRouteGraph, dijkstra, shortestPath } from '../src/services/graph';
import {
  readValidatedRouteDataset,
  saveValidatedRouteDataset,
  type RouteDatasetStorage,
} from '../src/services/route-cache-core';

function cloneRoutes(): Route[] {
  return structuredClone(getAllRoutes());
}

function createMemoryStorage(): RouteDatasetStorage & { value: string | null } {
  return {
    value: null,
    async getItem() { return this.value; },
    async setItem(_key: string, value: string) { this.value = value; },
  };
}

test('HU-08/19: el catálogo maestro aprueba exclusivamente 1A, D y 14', () => {
  const routes = getAllRoutes();
  assert.deepEqual(routes.filter((route) => route.pilot).map((route) => route.nombre), ['1A', 'D', '14']);
  assert.equal(routes.some((route) => route.nombre === '12'), false);
});

test('HU-05/08/10: catálogo, secuencias, referencias y pesos son válidos', () => {
  const result = validateRouteCatalog(getAllRoutes(), ROUTE_CATALOG_METADATA);
  assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  assert.deepEqual(
    [result.summary.pilots, result.summary.sequences, result.summary.layers],
    [3, 3, 8]
  );
  assert.ok(result.summary.coordinates > 0);
  assert.ok(result.summary.references > 0);
  assert.ok(result.summary.weights > result.summary.references);
});

test('HU-05/20: las capas cierran los circuitos sin inventar un inverso', () => {
  for (const route of getAllRoutes()) {
    const sequence = route.sequences[0];
    assert.equal(sequence.kind, 'circuit');
    assert.deepEqual(sequence.coordinates[0], sequence.coordinates.at(-1));
    assert.match(sequence.layers.at(-1)!.id, /retorno-tramo-compartido$/);
    assert.equal(sequence.layers.at(-1)!.visible, false);

    const graph = buildDirectedRouteGraph(
      sequence.coordinates,
      route.nombre,
      sequence.id,
      route.travelProfile
    );
    assert.equal(shortestPath(graph, graph.nodes.length - 1, 0), null);
    assert.equal(dijkstra(graph, graph.nodes.length - 1)[0], Infinity);
  }
});

test('HU-10/11: Dijkstra devuelve cero en el mismo nodo y reconstruye el camino dirigido', () => {
  const route = getAllRoutes()[0];
  const sequence = route.sequences[0];
  const graph = buildDirectedRouteGraph(
    sequence.coordinates.slice(0, 4),
    route.nombre,
    sequence.id,
    route.travelProfile
  );
  assert.deepEqual(shortestPath(graph, 2, 2), { distance: 0, path: [2] });
  assert.deepEqual(shortestPath(graph, 0, 3)?.path, [0, 1, 2, 3]);
  assert.equal(shortestPath(graph, 3, 0), null);
  assert.throws(() => dijkstra(graph, -1), /origen no existe/);
  assert.throws(() => shortestPath(graph, -1, -1), /origen no existe/);

  const branchedGraph = {
    ...graph,
    nodes: graph.nodes.slice(0, 4),
    adjacency: [
      { from: 0, to: 1, weight: 9, distance: 90 },
      { from: 0, to: 2, weight: 2, distance: 20 },
      { from: 2, to: 1, weight: 2, distance: 20 },
      { from: 1, to: 3, weight: 1, distance: 10 },
      { from: 2, to: 3, weight: 8, distance: 80 },
    ],
  };
  assert.deepEqual(shortestPath(branchedGraph, 0, 3), { distance: 5, path: [0, 2, 1, 3] });
});

test('HU-10/18: el peso suma penalidad solo al alcanzar una parada declarada', () => {
  const route = getAllRoutes()[0];
  const coordinates = route.sequences[0].coordinates.slice(0, 3);
  const baseGraph = buildDirectedRouteGraph(coordinates, route.nombre, 'peso-base', {
    ...route.travelProfile,
    stopPenaltyMinutes: 0,
  }, [1]);
  const penalizedGraph = buildDirectedRouteGraph(coordinates, route.nombre, 'peso-penalizado', {
    ...route.travelProfile,
    stopPenaltyMinutes: 1.5,
  }, [1]);
  assert.ok(Math.abs(penalizedGraph.adjacency[0].weight - baseGraph.adjacency[0].weight - 90) < 1e-9);
  assert.equal(penalizedGraph.adjacency[1].weight, baseGraph.adjacency[1].weight);
});

test('HU-08: frecuencias mostradas y usadas comparten el mismo dato maestro', () => {
  for (const route of getAllRoutes()) {
    assert.equal(route.frecuencia, `${route.service.headwayMinutes} min`);
    assert.ok(route.service.source.length > 0);
    assert.match(route.service.sourceDate, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('HU-08/10: el validador rechaza frecuencia incoherente y pesos inválidos', () => {
  const routes = cloneRoutes();
  routes[0].service.headwayMinutes = -1;
  routes[1].travelProfile.averageSpeedKmh = 0;
  routes[2].service.dispatchReferenceKind = 'scheduled';
  routes[2].service.dispatchReferenceMinute = null;
  const result = validateRouteCatalog(routes, ROUTE_CATALOG_METADATA);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'pilot.service-profile' && issue.routeId === routes[2].id));
  assert.ok(result.issues.some((issue) => issue.code === 'pilot.travel-profile'));
});

test('HU-08: un conjunto inválido no reemplaza al último catálogo íntegro', async () => {
  const storage = createMemoryStorage();
  const key = 'catalog-test';
  const firstWrite = await saveValidatedRouteDataset(
    storage,
    key,
    cloneRoutes(),
    ROUTE_CATALOG_METADATA,
    '2026-09-09T12:00:00.000Z'
  );
  const saved = storage.value;
  const invalidRoutes = cloneRoutes();
  invalidRoutes[2].sequences[0].coordinates = [];
  const rejected = await saveValidatedRouteDataset(
    storage,
    key,
    invalidRoutes,
    ROUTE_CATALOG_METADATA,
    '2026-09-09T13:00:00.000Z'
  );
  const recovered = await readValidatedRouteDataset(storage, key);
  assert.equal(firstWrite.saved, true);
  assert.equal(rejected.saved, false);
  assert.equal(storage.value, saved);
  assert.equal(recovered?.metadata.version, ROUTE_CATALOG_METADATA.version);
});
