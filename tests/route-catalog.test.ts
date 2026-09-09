import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllRoutes,
  ROUTE_CATALOG_METADATA,
  type Route,
} from '../src/services/routes';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';
import { buildGraphFromStops } from '../src/services/graph';
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
  assert.ok(result.summary.coordinates > 0);
  assert.ok(result.summary.references > 0);
  assert.ok(result.summary.weights > 0);

  getAllRoutes()
    .filter((route) => route.pilot)
    .forEach((route) => {
      const graph = buildGraphFromStops(route.stops);
      assert.ok(graph.adjacency.every((edge) => edge.to === edge.from + 1));
    });
});

test('el validador rechaza IDs duplicados y geometria incompleta', () => {
  const routes = cloneRoutes();
  routes[1].id = routes[0].id;
  routes[2].coordinates = null;
  routes[2].stops = [];

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
  assert.equal(recovered?.metadata.version, '2026-09-09');
  assert.deepEqual(
    recovered?.routes.filter((route) => route.pilot).map((route) => route.nombre),
    ['1A', 'D', '14']
  );
});
