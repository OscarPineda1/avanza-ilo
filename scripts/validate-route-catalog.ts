import {
  getAllRoutes,
  ROUTE_CATALOG_METADATA,
} from '../src/services/routes';
import { validateRouteCatalog } from '../src/services/route-catalog-validation';
import { buildGraphFromStops, dijkstra } from '../src/services/graph';

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
    `${result.summary.sequences} secuencias, ${result.summary.layers} capas, ` +
    `${result.summary.coordinates} coordenadas, ${result.summary.references} referencias y ` +
    `${result.summary.weights} pesos verificados.`
);

console.log('| Ruta | Secuencia | Tipo | Capas conservadas | Coordenadas | Aristas inversas |');
console.log('| --- | --- | --- | --- | ---: | ---: |');
getAllRoutes()
  .filter((route) => route.pilot)
  .forEach((route) => {
    route.sequences.forEach((sequence) => {
      const graph = buildGraphFromStops(sequence.stops);
      const inverseEdges = graph.adjacency.filter(
        (edge) => edge.to < edge.from
      ).length;
      console.log(
        `| ${route.nombre} | ${sequence.id} | ${sequence.kind} | ` +
          `${sequence.layers.map((layer) => layer.id).join(' → ')} | ` +
          `${sequence.coordinates.length} | ${inverseEdges} |`
      );
    });
  });

const sampleRoute = getAllRoutes().find((route) => route.nombre === '1A');
const sampleSequence = sampleRoute?.sequences[0];
const reverseIsUnreachable = sampleSequence
  ? dijkstra(
      buildGraphFromStops(sampleSequence.stops),
      sampleSequence.stops.length - 1
    )[0] === Infinity
  : false;

if (!result.valid || !reverseIsUnreachable) {
  result.issues.forEach((issue) => {
    console.error(`[${issue.code}] ${issue.message}`);
  });
  if (!reverseIsUnreachable) {
    console.error('[graph.reverse] El grafo invento un recorrido inverso.');
  }
  process.exitCode = 1;
} else {
  console.log('Resultado: VALIDO');
}
