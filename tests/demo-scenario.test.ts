import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEMO_DATA_VERSION,
  buildDemoRoutes,
  validateDemoWeights,
} from '../src/services/demo-scenario';
import { computeEta } from '../src/services/eta-core';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';
import { ROUTE_CATALOG_METADATA } from '../src/services/routes';

test('OE1/OE2 demo: completa despachos y pesos sin alterar maestros oficiales', () => {
  const routes = buildDemoRoutes();
  assert.deepEqual(routes.map((route) => route.nombre), ['1A', 'D', '14']);
  for (const route of routes) {
    assert.equal(route.service?.dispatchReferenceKind, 'estimated');
    assert.equal(route.travelProfile?.evidence, 'synthetic');
    assert.equal(route.empresa, 'Operador por confirmar');
    assert.equal(route.tarifa, '');
  }
  assert.ok(validateDemoWeights(routes).every((result) => result.allFiniteNonNegative));
});

test('HU-10/11/16/17: el escenario completo devuelve ETA para las tres rutas', () => {
  for (const route of buildDemoRoutes()) {
    const sequence = route.sequences[0];
    const waitPoint = sequence.stops[Math.floor(sequence.stops.length / 2)];
    const result = computeEta(
      route.nombre,
      waitPoint.id,
      12 * 60 + 3,
      sequence.id,
      route.service!,
      route.travelProfile!,
      DEMO_DATA_VERSION
    );
    assert.equal(result.status, 'arrival');
    assert.ok(result.minutes !== null && result.minutes >= 0);
    assert.equal(result.dataVersion, DEMO_DATA_VERSION);
  }
});

test('HU-12: el catálogo de demostración cumple el contrato consumido por la app', () => {
  const result = validateRouteCatalog(buildDemoRoutes(), {
    ...ROUTE_CATALOG_METADATA,
    version: DEMO_DATA_VERSION,
    source: 'Escenario de demostración AVANZA ILO',
    decision: 'Escenario temporal para demostrar OE1/OE2 con ETA activo.',
    etaReady: true,
  });
  assert.deepEqual(result.issues, []);
});
