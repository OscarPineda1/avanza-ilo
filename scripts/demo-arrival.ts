import { inferArrivalFromService } from '../src/services/eta-core';
import type { ServiceProfile } from '../src/services/routes';

const service: ServiceProfile = {
  startMinute: 7 * 60,
  endMinute: 7 * 60 + 20,
  headwayMinutes: 10,
  dispatchReferenceMinute: 7 * 60,
  dispatchReferenceKind: 'scheduled',
  source: 'Ejemplo sintético del informe, página 9',
  sourceDate: '2026-09-08',
};

const result = inferArrivalFromService(
  service,
  5,
  7 * 60 + 12,
  'Referencia C',
  'ejemplo-sintetico-p9'
);

console.log('Caso: A → B → C, 5 min acumulados; salidas 07:00/07:10/07:20; consulta 07:12.');
console.log('Esperado: llegada 07:15, ETA 3 min.');
console.log(`Obtenido: llegada ${result.estimatedArrival}, ETA ${result.minutes} min, estado ${result.status}.`);

if (result.estimatedArrival !== '07:15' || result.minutes !== 3) {
  process.exitCode = 1;
}
