import {
  getAllRoutes,
  ROUTE_CATALOG_METADATA,
} from '../src/services/routes';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';

const result = validateRouteCatalog(
  getAllRoutes(),
  ROUTE_CATALOG_METADATA
);

console.log(`Catalogo: ${ROUTE_CATALOG_METADATA.id}`);
console.log(`Version: ${ROUTE_CATALOG_METADATA.version}`);
console.log(`Fuente: ${ROUTE_CATALOG_METADATA.source}`);
console.log(`Fecha de fuente: ${ROUTE_CATALOG_METADATA.sourceDate}`);
console.log(
  `Pilotos aprobados: ${ROUTE_CATALOG_METADATA.approvedPilotRouteNames.join(', ')}`
);
console.log(
  `Resumen: ${result.summary.routes} rutas, ${result.summary.pilots} pilotos, ` +
    `${result.summary.coordinates} coordenadas, ${result.summary.references} referencias y ` +
    `${result.summary.weights} pesos verificados.`
);

if (!result.valid) {
  result.issues.forEach((issue) => {
    console.error(`[${issue.code}] ${issue.message}`);
  });
  process.exitCode = 1;
} else {
  console.log('Resultado: VALIDO');
}
