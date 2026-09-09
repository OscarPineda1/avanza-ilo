import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllRoutes,
  ROUTE_CATALOG_METADATA,
  type Route,
} from '../src/services/routes';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';
import { buildGraphFromStops, dijkstra } from '../src/services/graph';
import { computeEta } from '../src/services/eta-core';
import type { Stop } from '../src/services/stops';
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
    async getItem() {
      return this.value;
    },
    async setItem(_key: string, value: string) {
      this.value = value;
    },
  };
}

test('el catalogo maestro aprueba exclusivamente 1A, D y 14', () => {
  const routes = getAllRoutes();
  const pilotNames = routes
    .filter((route) => route.pilot)
    .map((route) => route.nombre);

  assert.deepEqual(pilotNames, ['1A', 'D', '14']);
  assert.equal(routes.some((route) => route.nombre === '12'), false);
  assert.equal(routes.find((route) => route.nombre === '14')?.id, '4');
});

test('el catalogo maestro cumple IDs, referencias, coordenadas, orden, sentido y pesos', () => {
  const result = validateRouteCatalog(
    getAllRoutes(),
    ROUTE_CATALOG_METADATA
  );

  assert.equal(result.valid, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.summary.pilots, 3);
  assert.equal(result.summary.sequences, 3);
  assert.equal(result.summary.layers, 5);
  assert.ok(result.summary.coordinates > 0);
  assert.ok(result.summary.references > 0);
  assert.ok(result.summary.weights > 0);

  getAllRoutes()
    .filter((route) => route.pilot)
    .forEach((route) => {
      const graph = buildGraphFromStops(route.stops);
      assert.ok(graph.adjacency.every((edge) => edge.to === edge.from + 1));
      assert.equal(graph.adjacency.length, route.stops.length - 1);
      assert.equal(dijkstra(graph, route.stops.length - 1)[0], Infinity);
    });
});

test('cada secuencia conserva las capas de My Maps en su orden publicado', () => {
  const expectedLayers = new Map([
    ['1A', ['1a-tramo-1', '1a-tramo-2']],
    ['D', ['d-trazo-publicado']],
    ['14', ['14-tramo-1', '14-tramo-2']],
  ]);

  getAllRoutes().forEach((route) => {
    const sequence = route.sequences.find(
      (candidate) => candidate.id === route.defaultSequenceId
    );
    assert.ok(sequence);
    assert.deepEqual(
      sequence.layers.map((layer) => layer.id),
      expectedLayers.get(route.nombre)
    );
    assert.equal(
      sequence.coordinates.length,
      sequence.layers.reduce(
        (total, layer) => total + layer.coordinates.length,
        0
      )
    );
  });
});

test('el calculo conserva ruta y sentido y no inventa el recorrido inverso', () => {
  const route1A = getAllRoutes().find((route) => route.nombre === '1A')!;
  const routeD = getAllRoutes().find((route) => route.nombre === 'D')!;
  const sequence = route1A.sequences[0];

  assert.ok(
    computeEta(
      route1A.nombre,
      sequence.stops[0].id,
      sequence.stops.at(-1)!.id,
      undefined,
      sequence.id
    )
  );
  assert.equal(
    computeEta(
      route1A.nombre,
      sequence.stops.at(-1)!.id,
      sequence.stops[0].id,
      undefined,
      sequence.id
    ),
    null
  );
  assert.equal(
    computeEta(
      route1A.nombre,
      sequence.stops[0].id,
      routeD.sequences[0].stops.at(-1)!.id,
      undefined,
      sequence.id
    ),
    null
  );
});

test('un circuito o cruce conserva nodos por posicion y solo aristas consecutivas', () => {
  const crossing = { latitude: -17.64, longitude: -71.32 };
  const stops: Stop[] = [
    {
      id: 'circuito-stop-1',
      routeName: 'C',
      sequenceId: 'circuito-publicado',
      name: 'Inicio',
      coordinate: crossing,
      isOrigin: true,
      isDestination: false,
      order: 0,
    },
    {
      id: 'circuito-stop-2',
      routeName: 'C',
      sequenceId: 'circuito-publicado',
      name: 'Intermedio',
      coordinate: { latitude: -17.641, longitude: -71.321 },
      isOrigin: false,
      isDestination: false,
      order: 1,
    },
    {
      id: 'circuito-stop-3',
      routeName: 'C',
      sequenceId: 'circuito-publicado',
      name: 'Cierre en el mismo cruce',
      coordinate: crossing,
      isOrigin: false,
      isDestination: true,
      order: 2,
    },
  ];

  const graph = buildGraphFromStops(stops);
  assert.deepEqual(
    graph.adjacency.map(({ from, to }) => [from, to]),
    [[0, 1], [1, 2]]
  );
  assert.deepEqual(graph.stopIndexes, [0, 1, 2]);
  assert.deepEqual(graph.nodes[0], graph.nodes[2]);
  assert.equal(dijkstra(graph, 2)[0], Infinity);
});

test('el grafo rechaza conexiones entre rutas o secuencias', () => {
  const route1A = getAllRoutes().find((route) => route.nombre === '1A')!;
  const routeD = getAllRoutes().find((route) => route.nombre === 'D')!;

  assert.throws(
    () =>
      buildGraphFromStops([
        route1A.sequences[0].stops[0],
        routeD.sequences[0].stops[0],
      ]),
    /misma ruta y secuencia/
  );
});

test('el validador rechaza un circuito sin cierre explicito', () => {
  const routes = cloneRoutes();
  routes[0].sequences[0].kind = 'circuit';

  const result = validateRouteCatalog(routes, ROUTE_CATALOG_METADATA);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.code === 'sequence.circuit-open')
  );
});

test('el validador rechaza IDs duplicados y geometria incompleta', () => {
  const routes = cloneRoutes();
  routes[1].id = routes[0].id;
  routes[2].coordinates = null;
  routes[2].stops = [];
  routes[2].sequences[0].coordinates = [];
  routes[2].sequences[0].layers[0].coordinates = [];
  routes[2].sequences[0].stops = [];

  const result = validateRouteCatalog(routes, ROUTE_CATALOG_METADATA);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'route.id'));
  assert.ok(result.issues.some((issue) => issue.code === 'pilot.coordinates'));
});

test('un conjunto invalido no reemplaza al ultimo catalogo integro', async () => {
  const storage = createMemoryStorage();
  const key = 'catalog-test';
  const firstWrite = await saveValidatedRouteDataset(
    storage,
    key,
    cloneRoutes(),
    ROUTE_CATALOG_METADATA,
    '2026-09-09T12:00:00.000Z'
  );
  const lastValidValue = storage.value;

  const invalidRoutes = cloneRoutes();
  invalidRoutes[2].coordinates = null;
  invalidRoutes[2].stops = [];
  invalidRoutes[2].sequences[0].coordinates = [];
  invalidRoutes[2].sequences[0].layers[0].coordinates = [];
  invalidRoutes[2].sequences[0].stops = [];
  const rejectedWrite = await saveValidatedRouteDataset(
    storage,
    key,
    invalidRoutes,
    ROUTE_CATALOG_METADATA,
    '2026-09-09T13:00:00.000Z'
  );
  const recovered = await readValidatedRouteDataset(storage, key);

  assert.equal(firstWrite.saved, true);
  assert.equal(rejectedWrite.saved, false);
  assert.equal(storage.value, lastValidValue);
  assert.equal(recovered?.metadata.version, '2026-09-09-hu20');
  assert.deepEqual(
    recovered?.routes.filter((route) => route.pilot).map((route) => route.nombre),
    ['1A', 'D', '14']
  );
});
