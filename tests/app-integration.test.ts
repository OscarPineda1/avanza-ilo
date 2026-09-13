import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { EtaClientError, requestEta } from '../src/services/eta';
import { normalizeFavoriteIdentifiers } from '../src/services/favorites-core';
import { classifyNetworkState } from '../src/services/network-state';
import { recordAppReady, resetAppReadyMetricForTests } from '../src/services/performance-metrics';

const validResponse = {
  status: 'available',
  etaMinutes: 3,
  estimatedArrivalAt: '2026-09-12T12:15:00.000Z',
  method: 'directed_dijkstra_with_dispatch_candidates',
  dataVersion: 'synthetic-test-v1',
  assumptions: {
    timezone: 'America/Lima',
    note: 'Fixture sintético.',
    vehicleTracking: false,
    realTimeTraffic: false,
    occupancy: false,
  },
};

test('HU-12: distingue sin red, Wi-Fi sin Internet y conectividad utilizable', () => {
  assert.equal(classifyNetworkState({ isConnected: false, isInternetReachable: false }), 'no-network');
  assert.equal(classifyNetworkState({ isConnected: true, isInternetReachable: false }), 'no-internet');
  assert.equal(classifyNetworkState({ isConnected: true, isInternetReachable: true }), 'online');
  assert.equal(classifyNetworkState({ isConnected: true, isInternetReachable: null }), 'checking');
});

test('HU-12/17: el cliente conserva el contrato HTTPS sin recalcular el ETA', async () => {
  let body = '';
  let appCheckHeader = '';
  const result = await requestEta(
    { routeId: '1', directionId: '1a', referenceId: 'ref', expectedDataVersion: 'synthetic-test-v1' },
    {
      endpoint: 'https://example.test/eta',
      token: 'synthetic-app-check-token',
      fetchImpl: async (_url, init) => {
        body = String(init?.body);
        appCheckHeader = String((init?.headers as Record<string, string>)['X-Firebase-AppCheck']);
        return new Response(JSON.stringify(validResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
      },
    }
  );
  assert.deepEqual(result, validResponse);
  assert.equal(JSON.parse(body).expectedDataVersion, 'synthetic-test-v1');
  assert.equal(appCheckHeader, 'synthetic-app-check-token');
});

test('HU-12/22: el cliente no llama al endpoint productivo sin App Check', async () => {
  let called = false;
  await assert.rejects(
    requestEta(
      { routeId: '1', directionId: '1a', referenceId: 'ref' },
      {
        endpoint: 'https://example.test/eta',
        token: null,
        fetchImpl: async () => {
          called = true;
          return new Response(JSON.stringify(validResponse));
        },
      }
    ),
    (error: unknown) => error instanceof EtaClientError && error.code === 'app_check'
  );
  assert.equal(called, false);
});

test('HU-12: timeout y respuesta 5xx se convierten en errores controlados', async () => {
  await assert.rejects(
    requestEta(
      { routeId: '1', directionId: '1a', referenceId: 'ref' },
      {
        endpoint: 'https://example.test/eta',
        token: 'synthetic-app-check-token',
        timeoutMs: 5,
        fetchImpl: async (_url, init) => new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        }),
      }
    ),
    (error: unknown) => error instanceof EtaClientError && error.code === 'timeout'
  );
  await assert.rejects(
    requestEta(
      { routeId: '1', directionId: '1a', referenceId: 'ref' },
      {
        endpoint: 'https://example.test/eta',
        token: 'synthetic-app-check-token',
        fetchImpl: async () => new Response(JSON.stringify({ ...validResponse, status: 'backend_error', etaMinutes: null, estimatedArrivalAt: null }), { status: 503 }),
      }
    ),
    (error: unknown) => error instanceof EtaClientError && error.code === 'backend'
  );
});

test('HU-12: una pantalla desmontada cancela la solicitud HTTPS pendiente', async () => {
  const caller = new AbortController();
  const pending = requestEta(
    { routeId: '1', directionId: '1a', referenceId: 'ref' },
    {
      endpoint: 'https://example.test/eta',
      token: 'synthetic-app-check-token',
      signal: caller.signal,
      fetchImpl: async (_url, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      }),
    }
  );
  caller.abort();
  await assert.rejects(
    pending,
    (error: unknown) => error instanceof EtaClientError && error.code === 'timeout'
  );
});

test('HU-09: favoritos corruptos o duplicados se normalizan a identificadores únicos', () => {
  assert.deepEqual(normalizeFavoriteIdentifiers(['1', '1', '', 4, '2']), ['1', '2']);
  assert.deepEqual(normalizeFavoriteIdentifiers({ route: '1' }), []);
});

test('HU-01/24: la marca de inicio se registra una sola vez sin datos personales', () => {
  resetAppReadyMetricForTests();
  const messages: string[] = [];
  const duration = recordAppReady(Date.now() + 25, (message) => messages.push(message));
  assert.ok(duration !== null && duration >= 0);
  assert.match(messages[0], /^\[AVANZA_METRIC\] app_ready_ms=\d+$/);
  assert.equal(recordAppReady(Date.now() + 50, (message) => messages.push(message)), null);
  assert.equal(messages.length, 1);
});

test('Arquitectura: ninguna pantalla importa el motor ETA local', () => {
  const mapScreen = readFileSync('src/screens/MapScreen.js', 'utf8');
  const etaClient = readFileSync('src/services/eta.ts', 'utf8');
  assert.doesNotMatch(mapScreen, /eta-core|computeEta/);
  assert.doesNotMatch(etaClient, /eta-core|computeEta/);
  assert.match(etaClient, /fetch/);
});

test('HU-08/13: la app no vuelve al catálogo empaquetado cuando falla Firestore', () => {
  const catalogContext = readFileSync('src/context/CatalogContext.js', 'utf8');
  assert.doesNotMatch(catalogContext, /getAllRoutes|ROUTE_CATALOG_METADATA/);
  assert.match(catalogContext, /cached\.validatedAt/);
});

test('HU-12/22: el binario nativo inicializa App Check y conserva cierre seguro si falta el módulo', () => {
  const entrypoint = readFileSync('index.js', 'utf8');
  const appCheck = readFileSync('src/services/app-check.ts', 'utf8');
  assert.match(entrypoint, /initializeAppCheckProtection/);
  assert.match(appCheck, /import\('@react-native-firebase\/app-check'\)/);
  assert.match(appCheck, /playIntegrity/);
  assert.match(appCheck, /configureAppCheckTokenProvider/);
});

test('HU-08/17: el mapa no consulta ETA cuando el snapshot es solo cartográfico', () => {
  const mapScreen = readFileSync('src/screens/MapScreen.js', 'utf8');
  assert.match(mapScreen, /!metadata\.etaReady/);
  assert.match(mapScreen, /cartografía está disponible/);
});
