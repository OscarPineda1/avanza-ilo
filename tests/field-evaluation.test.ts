import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFieldEvaluationReport, parseFieldObservations } from '../src/services/field-evaluation';

const header = 'record_id,set,route_id,direction_id,wait_point_id,time_band,data_version,method,prediction_recorded_at,estimated_arrival_at,observed_arrival_at,extraordinary_event,observer_code,notes';

test('HU-25: calcula métricas reproducibles solo con fixture sintético reservado de prueba', () => {
  const rows = [
    'synthetic-1,test,1,ida,a,mañana,synthetic-test-v1,dijkstra,2026-09-12T12:00:00Z,2026-09-12T12:10:00Z,2026-09-12T12:08:00Z,,obs-a,fixture sintético',
    'synthetic-2,test,1,ida,a,mañana,synthetic-test-v1,dijkstra,2026-09-12T12:15:00Z,2026-09-12T12:20:00Z,2026-09-12T12:24:00Z,lluvia,obs-a,fixture sintético',
    'synthetic-3,calibration,1,ida,a,mañana,synthetic-test-v1,dijkstra,2026-09-12T11:00:00Z,2026-09-12T11:10:00Z,2026-09-12T11:09:00Z,,obs-a,no evaluar',
  ];
  const report = buildFieldEvaluationReport(parseFieldObservations([header, ...rows].join('\n')));
  assert.deepEqual(report.allTestObservations, {
    n: 2,
    maeMinutes: 3,
    rmseMinutes: 3.16,
    biasMinutes: -1,
    maxAbsoluteErrorMinutes: 4,
    coverageWithinFiveMinutesPercent: 100,
  });
  assert.equal(report.ordinaryTestObservations?.n, 1);
});

test('HU-25: rechaza registros posteriores al arribo y conjuntos sin prueba reservada', () => {
  const invalid = `${header}\nlate,test,1,ida,a,mañana,v1,m,2026-09-12T12:10:00Z,2026-09-12T12:09:00Z,2026-09-12T12:08:00Z,,obs-a,`;
  assert.throws(() => parseFieldObservations(invalid), /después del arribo/);
  const calibration = `${header}\nc1,calibration,1,ida,a,mañana,v1,m,2026-09-12T12:00:00Z,2026-09-12T12:09:00Z,2026-09-12T12:10:00Z,,obs-a,`;
  assert.throws(() => buildFieldEvaluationReport(parseFieldObservations(calibration)), /set=test/);
});
