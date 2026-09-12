import assert from 'node:assert/strict';
import test from 'node:test';
import { dijkstra, inferEta, validateEtaRequest } from '../src/eta-engine';
import { validatePublishedSnapshot } from '../src/snapshot-validator';
import type { PublishedSnapshot } from '../src/contracts';

function haversineMeters() {
  const latitudeA = -17.6433 * Math.PI / 180;
  const latitudeB = -17.6433 * Math.PI / 180;
  const dLongitude = (-71.3344 + 71.3444) * Math.PI / 180;
  const h = Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(dLongitude / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function syntheticSnapshot(): PublishedSnapshot {
  const distanceKm = haversineMeters() / 1000;
  return {
    schemaVersion: 1,
    status: 'published',
    dataVersion: 'synthetic-test-v1',
    source: 'Fixture sintético para pruebas automatizadas',
    sourceDate: '2026-09-12',
    geometrySourceDate: '2026-09-12',
    decision: 'Datos exclusivos de prueba; no publicar como datos reales.',
    publishedAt: '2026-09-12T12:00:00.000Z',
    routes: ['1A', 'D', '14'].map((name, routeIndex) => ({
      id: String(routeIndex + 1),
      nombre: name,
      descripcion: 'Fixture sintético',
      origen: 'A',
      destino: 'B',
      color: '#0057B8',
      empresa: 'Prueba',
      zona: 'Prueba',
      horario: '07:00 - 08:00',
      tarifa: '',
      frecuencia: '10 min',
      available: true,
      pilot: true,
      sentido: `${name}-synthetic`,
      defaultSequenceId: `${name}-synthetic`,
      sequences: [{
        id: `${name}-synthetic`,
        label: 'Circuito sintético',
        kind: 'direction' as const,
        coordinates: [
          { latitude: -17.6433, longitude: -71.3444 },
          { latitude: -17.6433, longitude: -71.3344 },
        ],
        stops: [
          { id: `${name}-a`, routeName: name, sequenceId: `${name}-synthetic`, name: 'A', coordinate: { latitude: -17.6433, longitude: -71.3444 }, coordinateIndex: 0, order: 0, isOrigin: true },
          { id: `${name}-b`, routeName: name, sequenceId: `${name}-synthetic`, name: 'B', coordinate: { latitude: -17.6433, longitude: -71.3344 }, coordinateIndex: 1, order: 1, isDestination: true },
        ],
      }],
      service: {
        startMinute: 7 * 60,
        endMinute: 8 * 60,
        headwayMinutes: 10,
        dispatchReferenceMinute: 7 * 60,
        dispatchReferenceKind: 'scheduled' as const,
        timezone: 'America/Lima' as const,
        source: 'Fixture sintético para pruebas automatizadas',
        sourceDate: '2026-09-12',
      },
      travelProfile: {
        id: 'synthetic-five-minutes',
        band: 'prueba',
        averageSpeedKmh: distanceKm * 12,
        stopPenaltyMinutes: 0,
        source: 'Fixture sintético para pruebas automatizadas',
        sourceDate: '2026-09-12',
        evidence: 'synthetic' as const,
        weightUnit: 'seconds' as const,
      },
    })),
  };
}

test('HU-10: Dijkstra conserva la dirección y deja inalcanzable el origen desde el final', () => {
  const forward = dijkstra([{ from: 0, to: 1, weightSeconds: 30 }], 2, 0);
  const reverse = dijkstra([{ from: 0, to: 1, weightSeconds: 30 }], 2, 1);
  assert.equal(forward[1], 30);
  assert.equal(reverse[0], Infinity);
});

test('HU-16/17: 07:12 selecciona el despacho 07:10 que llega 07:15', () => {
  const result = inferEta(syntheticSnapshot(), {
    routeId: '1',
    directionId: '1A-synthetic',
    referenceId: '1A-b',
    expectedDataVersion: 'synthetic-test-v1',
  }, new Date('2026-09-12T12:12:00.000Z'));
  assert.equal(result.status, 'available');
  assert.equal(result.etaMinutes, 3);
  assert.equal(result.estimatedArrivalAt, '2026-09-12T12:15:00.000Z');
  assert.equal(result.method, 'directed_dijkstra_with_dispatch_candidates');
});

test('HU-15/17: sin fase de despacho solo devuelve espera promedio etiquetada', () => {
  const snapshot = syntheticSnapshot();
  snapshot.routes[0].service.dispatchReferenceKind = 'none';
  snapshot.routes[0].service.dispatchReferenceMinute = null;
  const result = inferEta(snapshot, {
    routeId: '1', directionId: '1A-synthetic', referenceId: '1A-b',
  }, new Date('2026-09-12T12:12:00.000Z'));
  assert.equal(result.status, 'average_wait');
  assert.equal(result.etaMinutes, 5);
  assert.equal(result.estimatedArrivalAt, null);
});

test('HU-22: el contrato rechaza punto ausente, doble o fuera de rango', () => {
  assert.equal(validateEtaRequest({ routeId: '1', directionId: 'x' }).valid, false);
  assert.equal(validateEtaRequest({ routeId: '1', directionId: 'x', referenceId: 'a', waitPosition: { segmentIndex: 0, fraction: .5 } }).valid, false);
  assert.equal(validateEtaRequest({ routeId: '1', directionId: 'x', waitPosition: { segmentIndex: 0, fraction: 2 } }).valid, false);
});

test('HU-19: la validación rechaza el conflicto ruta 12', () => {
  const snapshot = syntheticSnapshot();
  snapshot.routes[2].nombre = '12';
  assert.equal(validatePublishedSnapshot(snapshot).valid, false);
});
