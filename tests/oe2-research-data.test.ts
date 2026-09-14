import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOe2ResearchData } from '../src/services/oe2-research-data';

test('OE2/HU-20: la exportación conserva el cierre exacto de cada circuito', () => {
  const data = buildOe2ResearchData();

  assert.equal(data.circuits.length, 3);
  assert.ok(data.circuits.every((circuit) => circuit.closesExactly));
  assert.ok(data.circuits.every((circuit) => circuit.closureDistanceMeters === 0));
  assert.equal(
    data.geometry.filter((row) => row.closesCircuit).length,
    data.circuits.length
  );
});

test('OE2/HU-08/18: solo se derivan distancias; no se fabrican tiempos ni métricas OE3', () => {
  const data = buildOe2ResearchData();

  assert.equal(data.dataset.cartographyReady, true);
  assert.equal(data.dataset.etaReady, false);
  assert.deepEqual(data.routes.map((route) => route.fareSoles), [null, null, null]);
  assert.ok(data.geometry.every((row) => row.distanceToNextMeters === null || row.distanceToNextMeters > 0));
  assert.ok(data.services.every((service) => service.evidenceStatus === 'no encontrado; no habilita ETA'));
  assert.deepEqual(data.scope.oe3Only.slice(0, 4), ['MAE', 'RMSE', 'sesgo', 'cobertura dentro del umbral']);
});
