import assert from 'node:assert/strict';

import { DEMO_DATA_VERSION, buildDemoRoutes } from '../src/services/demo-scenario';

async function main(): Promise<void> {
  const projectId = process.env.GCLOUD_PROJECT ?? 'demo-avanza-ilo';
  const endpoint = `http://127.0.0.1:5001/${projectId}/us-central1/eta`;
  const route = buildDemoRoutes()[0];
  const sequence = route.sequences[0];
  const reference = sequence.stops[Math.floor(sequence.stops.length / 2)];
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routeId: route.id,
      directionId: sequence.id,
      referenceId: reference.id,
      expectedDataVersion: DEMO_DATA_VERSION,
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'available');
  assert.equal(body.method, 'directed_dijkstra_with_dispatch_candidates');
  assert.equal(body.dataVersion, DEMO_DATA_VERSION);
  assert.equal(body.assumptions.weightEvidence, 'synthetic');
  assert.ok(Number.isFinite(body.etaMinutes) && body.etaMinutes >= 0);
  console.log(JSON.stringify({
    status: body.status,
    etaMinutes: body.etaMinutes,
    estimatedArrivalAt: body.estimatedArrivalAt,
    method: body.method,
    dataVersion: body.dataVersion,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
