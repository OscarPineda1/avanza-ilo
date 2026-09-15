import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import {
  DEMO_DATA_VERSION,
  DEMO_SOURCE,
  buildDemoRoutes,
} from '../src/services/demo-scenario';
import { buildDirectedRouteGraph } from '../src/services/graph';
import { haversineDistance } from '../src/services/haversine';
import { computeEta } from '../src/services/eta-core';

const DEMO_DATE = '2026-09-14';

function isoAtMinute(minute: number, seconds = 0): string {
  const base = Date.parse(`${DEMO_DATE}T00:00:00-05:00`);
  return new Date(base + minute * 60_000 + seconds * 1000).toISOString();
}

function clock(minute: number): string {
  const normalized = Math.floor(minute);
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  const outputPath = resolve(
    process.argv[2] ?? 'outputs/avanza-ilo-datos-20260913/oe1-oe2-demo-sintetico.json'
  );
  const routes = buildDemoRoutes();
  const dispatches: Array<Record<string, unknown>> = [];
  const gpsPoints: Array<Record<string, unknown>> = [];
  const segmentTimes: Array<Record<string, unknown>> = [];
  const etaSamples: Array<Record<string, unknown>> = [];

  for (const route of routes) {
    const sequence = route.sequences[0];
    const service = route.service!;
    const profile = route.travelProfile!;
    const graph = buildDirectedRouteGraph(
      sequence.coordinates,
      route.nombre,
      sequence.id,
      profile,
      sequence.stops.map((stop) => stop.coordinateIndex)
    );

    for (let departure = service.startMinute, number = 1; departure <= service.endMinute; departure += service.headwayMinutes, number += 1) {
      dispatches.push({
        dispatchId: `demo-${route.nombre.toLowerCase()}-${String(number).padStart(3, '0')}`,
        serviceDate: DEMO_DATE,
        routeCode: route.nombre,
        sequenceId: sequence.id,
        startPointId: sequence.stops[0].id,
        scheduledTime: clock(departure),
        departureTime: clock(departure),
        sourceType: 'simulación determinista',
        extraordinaryEvent: false,
        dataset: 'demostración_oe1_oe2',
        evidenceFile: 'generated:oe1-oe2-demo-sintetico.json',
        notes: DEMO_SOURCE,
      });
    }

    const stopByIndex = new Map(sequence.stops.map((stop) => [stop.coordinateIndex, stop]));
    let cumulativeSeconds = 0;
    sequence.coordinates.forEach((coordinate, coordinateIndex) => {
      const stop = stopByIndex.get(coordinateIndex);
      gpsPoints.push({
        trackId: `demo-track-${route.nombre.toLowerCase()}`,
        timestamp: isoAtMinute(service.startMinute, cumulativeSeconds),
        routeCode: route.nombre,
        sequenceId: sequence.id,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        accuracyMeters: 5,
        speedMetersSecond: profile.averageSpeedKmh / 3.6,
        stopped: Boolean(stop && coordinateIndex > 0),
        referenceId: stop?.id ?? null,
        dataset: 'demostración_oe1_oe2',
        device: 'simulador determinista',
        sourceFile: 'generated:oe1-oe2-demo-sintetico.json',
        notes: DEMO_SOURCE,
      });
      const edge = graph.adjacency[coordinateIndex];
      if (!edge) return;
      const movingSeconds = haversineDistance(
        sequence.coordinates[coordinateIndex],
        sequence.coordinates[coordinateIndex + 1]
      ) / (profile.averageSpeedKmh * 1000 / 3600);
      const stopSeconds = edge.weight - movingSeconds;
      segmentTimes.push({
        measurementId: `demo-${route.nombre.toLowerCase()}-edge-${coordinateIndex}`,
        trackId: `demo-track-${route.nombre.toLowerCase()}`,
        measurementDate: DEMO_DATE,
        routeCode: route.nombre,
        sequenceId: sequence.id,
        fromId: `${sequence.id}-coord-${coordinateIndex}`,
        toId: `${sequence.id}-coord-${coordinateIndex + 1}`,
        fromIndex: coordinateIndex,
        toIndex: coordinateIndex + 1,
        startedAt: isoAtMinute(service.startMinute, cumulativeSeconds),
        endedAt: isoAtMinute(service.startMinute, cumulativeSeconds + edge.weight),
        travelSeconds: Math.round(movingSeconds * 1000) / 1000,
        stopSeconds: Math.round(stopSeconds * 1000) / 1000,
        weightSeconds: Math.round(edge.weight * 1000) / 1000,
        band: profile.band,
        dataset: 'demostración_oe1_oe2',
        sourceType: 'simulación por distancia y velocidad declarada',
        evidenceFile: 'generated:oe1-oe2-demo-sintetico.json',
        extraordinaryEvent: false,
        notes: `${DEMO_SOURCE} Perfil ${profile.id}; unidad seconds.`,
      });
      cumulativeSeconds += edge.weight;
    });

    [7 * 60 + 12, 12 * 60 + 3, 20 * 60 + 47].forEach((queryMinute, sampleIndex) => {
      const stop = sequence.stops[Math.min(2 + sampleIndex * 2, sequence.stops.length - 2)];
      const result = computeEta(
        route.nombre,
        stop.id,
        queryMinute,
        sequence.id,
        service,
        profile,
        DEMO_DATA_VERSION
      );
      const estimatedArrivalAt = result.estimatedArrival
        ? `${DEMO_DATE}T${result.estimatedArrival}:00-05:00`
        : null;
      etaSamples.push({
        recordId: `demo-eta-${route.nombre.toLowerCase()}-${sampleIndex + 1}`,
        routeCode: route.nombre,
        sequenceId: sequence.id,
        waitPointId: stop.id,
        queryAt: isoAtMinute(queryMinute),
        status: result.status,
        etaMinutes: result.minutes,
        estimatedArrivalAt,
        method: result.method,
        dataVersion: result.dataVersion,
        predictionRecordedAt: isoAtMinute(queryMinute),
        dataset: 'demostración_oe1_oe2',
        notes: `${DEMO_SOURCE} No contiene llegada observada ni métricas de OE3.`,
      });
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    dataVersion: DEMO_DATA_VERSION,
    source: DEMO_SOURCE,
    productionEligible: false,
    routes,
    dispatches,
    gpsPoints,
    segmentTimes,
    etaSamples,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    outputPath,
    routes: routes.length,
    dispatches: dispatches.length,
    gpsPoints: gpsPoints.length,
    segmentTimes: segmentTimes.length,
    etaSamples: etaSamples.length,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
