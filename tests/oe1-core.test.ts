import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildArrivalCandidates,
  computeEta,
  inferArrivalFromService,
  travelMinutesToPosition,
} from '../src/services/eta-core';
import { findRoutePositionCandidates, positionFromStop } from '../src/services/route-position';
import { searchRoutes } from '../src/services/route-search';
import { getAllRoutes, getRouteSequence, type ServiceProfile } from '../src/services/routes';
import { absoluteErrorMinutes, calibrateTravelProfile } from '../src/services/travel-calibration';

const syntheticService: ServiceProfile = {
  startMinute: 7 * 60,
  endMinute: 7 * 60 + 20,
  headwayMinutes: 10,
  dispatchReferenceMinute: 7 * 60,
  dispatchReferenceKind: 'scheduled',
  source: 'Caso sintético del informe, página 9',
  sourceDate: '2026-09-08',
};

test('HU-02: búsqueda normaliza mayúsculas, espacios y tildes sin inventar rutas', () => {
  const routes = getAllRoutes();
  assert.deepEqual(searchRoutes(routes, '  ruta   TRONCAL  ').map((route) => route.nombre), ['14']);
  assert.deepEqual(searchRoutes(routes, 'pampa inalambrica').map((route) => route.nombre), ['1A']);
  assert.deepEqual(searchRoutes(routes, '').map((route) => route.nombre), ['1A', 'D', '14']);
  assert.deepEqual(searchRoutes(routes, '99'), []);
});

test('HU-06/07: una referencia conserva ruta, sentido, tramo y posición', () => {
  const route = getAllRoutes()[0];
  const sequence = route.sequences[0];
  const position = positionFromStop(sequence.stops[3], sequence);
  assert.equal(position.routeName, route.nombre);
  assert.equal(position.sequenceId, sequence.id);
  assert.equal(position.segmentIndex, sequence.stops[3].coordinateIndex);
  assert.equal(position.source, 'reference');
  assert.ok(travelMinutesToPosition(route.nombre, position)! > 0);
});

test('HU-06: tocar la línea crea una selección asociada al segmento y rechaza puntos lejanos', () => {
  const route = getAllRoutes()[0];
  const sequence = route.sequences[0];
  const coordinate = sequence.coordinates[120];
  const candidates = findRoutePositionCandidates(route.nombre, sequence, coordinate, 20);
  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].routeName, route.nombre);
  assert.equal(candidates[0].sequenceId, sequence.id);
  assert.equal(candidates[0].source, 'map');
  assert.deepEqual(
    findRoutePositionCandidates(route.nombre, sequence, { latitude: -17.75, longitude: -71.45 }, 20),
    []
  );
});

test('HU-06/20: un tramo compartido ofrece ida y regreso como pasos distintos', () => {
  const route = getAllRoutes()[0];
  const sequence = route.sequences[0];
  const coordinate = sequence.layers[0].coordinates[100];
  const candidates = findRoutePositionCandidates(route.nombre, sequence, coordinate, 20);
  assert.equal(candidates.length, 2);
  assert.deepEqual(new Set(candidates.map((item) => item.passageLabel)), new Set(['Tramo de ida', 'Tramo de regreso']));
});

test('HU-11/16/17: caso manual 07:12 elige la unidad ya despachada que llega 07:15', () => {
  const candidates = buildArrivalCandidates(syntheticService, 5, 7 * 60 + 12);
  assert.deepEqual(
    candidates.map((candidate) => [
      candidate.departureTime,
      candidate.arrivalTime,
      candidate.alreadyDispatched,
      candidate.decision,
    ]),
    [
      ['07:00', '07:05', true, 'discarded-before-query'],
      ['07:10', '07:15', true, 'selected'],
      ['07:20', '07:25', false, 'later'],
    ]
  );
  const result = inferArrivalFromService(syntheticService, 5, 7 * 60 + 12, 'C', 'sintético-v1');
  assert.equal(result.status, 'arrival');
  assert.equal(result.minutes, 3);
  assert.equal(result.estimatedArrival, '07:15');
  assert.equal(result.dataVersion, 'sintético-v1');
});

test('HU-11/16: cubre llegada exacta, antes del servicio, última unidad en ruta y cierre', () => {
  assert.equal(inferArrivalFromService(syntheticService, 5, 7 * 60 + 15, 'C').minutes, 0);
  assert.equal(inferArrivalFromService(syntheticService, 5, 6 * 60 + 50, 'C').estimatedArrival, '07:05');
  assert.equal(inferArrivalFromService(syntheticService, 5, 7 * 60 + 22, 'C').estimatedArrival, '07:25');
  assert.equal(inferArrivalFromService(syntheticService, 5, 7 * 60 + 26, 'C').status, 'out-of-service');
});

test('HU-08/11/17: sin fase temporal no fabrica una próxima unidad', () => {
  const route = getAllRoutes()[0];
  const sequence = getRouteSequence(route.nombre)!;
  const result = computeEta(route.nombre, sequence.stops[2].id, 12 * 60, sequence.id);
  assert.equal(result.status, 'average-wait');
  assert.equal(result.minutes, route.service.headwayMinutes / 2);
  assert.equal(result.estimatedArrival, null);
  assert.match(result.condition, /no existe una fase/i);
});

test('HU-11/17: ruta, sentido o dato temporal incompatible se reporta como no disponible', () => {
  const route = getAllRoutes()[0];
  const other = getAllRoutes()[1];
  const foreignPoint = positionFromStop(other.sequences[0].stops[2], other.sequences[0]);
  assert.equal(computeEta(route.nombre, foreignPoint, 12 * 60, route.defaultSequenceId).status, 'unavailable');
  assert.equal(
    inferArrivalFromService({ ...syntheticService, headwayMinutes: -2 }, 5, 7 * 60 + 12, 'C').status,
    'unavailable'
  );
  assert.equal(
    inferArrivalFromService({ ...syntheticService, dispatchReferenceMinute: null }, 5, 7 * 60 + 12, 'C').status,
    'unavailable'
  );
  assert.equal(
    inferArrivalFromService(syntheticService, 5, Number.NaN, 'C').queryTime,
    '--:--'
  );
});

test('HU-18: calibración manual usa solo su conjunto y exige tiempos con detenciones', () => {
  const result = calibrateTravelProfile([
    {
      id: 'CAL-01', routeName: '1A', sequenceId: '1a-publicado', band: 'mañana',
      distanceMeters: 5000, durationMinutes: 20, includesStops: true,
      observedAt: '2026-09-09T08:00:00-05:00', dataset: 'calibration',
    },
    {
      id: 'TEST-01', routeName: '1A', sequenceId: '1a-publicado', band: 'mañana',
      distanceMeters: 5000, durationMinutes: 30, includesStops: true,
      observedAt: '2026-09-09T09:00:00-05:00', dataset: 'test',
    },
  ], 'perfil-prueba', '2026-09-09');
  assert.equal(result.profile.averageSpeedKmh, 15);
  assert.deepEqual(result.observationIds, ['CAL-01']);
  assert.equal(absoluteErrorMinutes(20, 23), 3);
  assert.throws(() => calibrateTravelProfile([], 'vacío', '2026-09-09'), /requiere observaciones/);
});
