import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test, { after, before } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAllRoutes, ROUTE_CATALOG_METADATA } from '../../src/services/routes';

const projectId = 'demo-avanza-ilo';
let environment: RulesTestEnvironment;

before(async () => {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('npm_execpath no está disponible para publicar el fixture del emulador.');
  execFileSync(process.execPath, [npmCli, '--prefix', 'functions', 'run', 'publish:emulator'], {
    cwd: process.cwd(),
    env: { ...process.env, GCLOUD_PROJECT: projectId },
    stdio: 'inherit',
  });
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

after(async () => {
  await environment?.cleanup();
});

test('HU-08: el cliente lee solo la versión publicada y no puede escribir maestros', async () => {
  const firestore = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(firestore, 'publication/current')));
  await assertSucceeds(getDoc(doc(firestore, 'publishedSnapshots', ROUTE_CATALOG_METADATA.version)));
  await assertFails(getDoc(doc(firestore, 'publishedSnapshots', 'version-no-publicada')));
  await assertFails(setDoc(doc(firestore, 'publication/current'), { dataVersion: 'alterada' }));
  await assertFails(setDoc(doc(firestore, 'publishedSnapshots/alterada'), { status: 'published' }));
  await assertFails(getDoc(doc(firestore, 'adminCatalogDrafts', ROUTE_CATALOG_METADATA.version)));
});

test('HU-22/23: Function valida el contrato y responde con el snapshot de Firestore', async () => {
  const route = getAllRoutes()[0];
  const sequence = route.sequences[0];
  const endpoint = `http://127.0.0.1:5001/${projectId}/us-central1/eta`;
  const invalid = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId: route.id }),
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).status, 'invalid_input');

  const stale = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routeId: route.id,
      directionId: sequence.id,
      referenceId: sequence.stops[1].id,
      expectedDataVersion: 'stale-version',
    }),
  });
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).status, 'version_mismatch');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routeId: route.id,
      directionId: sequence.id,
      referenceId: sequence.stops[1].id,
      expectedDataVersion: ROUTE_CATALOG_METADATA.version,
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(['average_wait', 'out_of_service'].includes(body.status));
  assert.equal(body.dataVersion, ROUTE_CATALOG_METADATA.version);
  assert.equal(body.assumptions.timezone, 'America/Lima');
  assert.equal(body.assumptions.vehicleTracking, false);
  assert.equal(body.assumptions.realTimeTraffic, false);
});
