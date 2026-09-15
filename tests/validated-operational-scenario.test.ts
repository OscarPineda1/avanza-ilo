import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VALIDATED_OPERATIONAL_DATA_VERSION,
  buildValidatedOperationalRoutes,
  validateOperationalWeights,
} from '../src/services/validated-operational-scenario';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';

test('HU-15/18: la línea base validada conserva frecuencias, fases y pesos publicables', () => {
  const routes = buildValidatedOperationalRoutes();
  const expectedHeadways: Record<string, number> = { '1A': 10, D: 12, '14': 15 };

  assert.equal(VALIDATED_OPERATIONAL_DATA_VERSION, '2026-09-15-oe1-oe2-validado-v1');
  assert.deepEqual(routes.map((route) => route.nombre), ['1A', 'D', '14']);
  routes.forEach((route) => {
    assert.equal(route.service?.headwayMinutes, expectedHeadways[route.nombre]);
    assert.equal(route.service?.dispatchReferenceMinute, 360);
    assert.equal(route.service?.dispatchReferenceKind, 'scheduled');
    assert.equal(route.travelProfile?.evidence, 'validated');
  });

  const weights = validateOperationalWeights(routes);
  assert.equal(weights.reduce((sum, route) => sum + route.edgeCount, 0), 3030);
  assert.ok(weights.every((route) => route.allFiniteNonNegative));
});

test('HU-08/19/20: el catálogo operativo validado conserva cartografía y ETA coherentes', () => {
  const routes = buildValidatedOperationalRoutes();
  const validation = validateRouteCatalog(routes, {
    id: 'avanza-ilo-rutas-piloto',
    version: VALIDATED_OPERATIONAL_DATA_VERSION,
    source: 'Matriz operativa validada',
    sourceDate: '2026-09-15',
    geometrySourceDate: '2026-08-19',
    approvedPilotRouteNames: ['1A', 'D', '14'],
    decision: 'Activación ETA autorizada.',
    cartographyReady: true,
    etaReady: true,
  });

  assert.equal(validation.valid, true, JSON.stringify(validation.issues));
  assert.equal(validation.summary.weights, 3030);
});
