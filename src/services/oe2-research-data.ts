import { haversineDistance } from './haversine';
import {
  getPilotRoutes,
  ROUTE_CATALOG_METADATA,
  type Route,
} from './routes';

export type Oe2GeometryRow = {
  coordinateId: string;
  routeId: string;
  routeCode: string;
  sequenceId: string;
  layerId: string;
  layerSource: string;
  coordinateIndex: number;
  latitude: number;
  longitude: number;
  isStart: boolean;
  isEnd: boolean;
  closesCircuit: boolean;
  distanceToNextMeters: number | null;
  cumulativeDistanceMeters: number;
};

export type Oe2ResearchData = ReturnType<typeof buildOe2ResearchData>;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseFareSoles(value: string): number | null {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function buildGeometryRows(route: Route): Oe2GeometryRow[] {
  const sequence = route.sequences[0];
  const rows: Oe2GeometryRow[] = [];
  let coordinateIndex = 0;
  let cumulativeDistanceMeters = 0;

  for (const layer of [...sequence.layers].sort((left, right) => left.order - right.order)) {
    for (const coordinate of layer.coordinates) {
      const nextCoordinate = sequence.coordinates[coordinateIndex + 1];
      const distanceToNextMeters = nextCoordinate
        ? haversineDistance(coordinate, nextCoordinate)
        : null;

      rows.push({
        coordinateId: `${sequence.id}-coord-${coordinateIndex}`,
        routeId: route.id,
        routeCode: route.nombre,
        sequenceId: sequence.id,
        layerId: layer.id,
        layerSource: layer.sourceName,
        coordinateIndex,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        isStart: coordinateIndex === 0,
        isEnd: coordinateIndex === sequence.coordinates.length - 1,
        closesCircuit:
          coordinateIndex === sequence.coordinates.length - 1 &&
          coordinate.latitude === sequence.coordinates[0].latitude &&
          coordinate.longitude === sequence.coordinates[0].longitude,
        distanceToNextMeters: distanceToNextMeters === null
          ? null
          : round(distanceToNextMeters, 3),
        cumulativeDistanceMeters: round(cumulativeDistanceMeters, 3),
      });

      if (distanceToNextMeters !== null) {
        cumulativeDistanceMeters += distanceToNextMeters;
      }
      coordinateIndex += 1;
    }
  }

  return rows;
}

export function buildOe2ResearchData(routes = getPilotRoutes()) {
  const geometry = routes.flatMap(buildGeometryRows);

  return {
    generatedAt: new Date().toISOString(),
    dataset: {
      id: ROUTE_CATALOG_METADATA.id,
      version: ROUTE_CATALOG_METADATA.version,
      source: ROUTE_CATALOG_METADATA.source,
      sourceDate: ROUTE_CATALOG_METADATA.sourceDate,
      geometrySourceDate: ROUTE_CATALOG_METADATA.geometrySourceDate,
      decision: ROUTE_CATALOG_METADATA.decision,
      cartographyReady: ROUTE_CATALOG_METADATA.cartographyReady,
      etaReady: ROUTE_CATALOG_METADATA.etaReady,
    },
    routes: routes.map((route) => ({
      recordId: `route-${route.id}`,
      routeId: route.id,
      routeCode: route.nombre,
      publicName: route.descripcion,
      operator: route.empresa,
      publicOrigin: route.origen,
      publicDestination: route.destino,
      zone: route.zona,
      fareSoles: parseFareSoles(route.tarifa),
      sequenceId: route.defaultSequenceId,
      sequenceLabel: route.sentido,
      source: 'Catálogo activo en Firestore; campos operativos pendientes de fuente oficial',
      sourceDate: ROUTE_CATALOG_METADATA.sourceDate,
      validationStatus: 'cartografía validada; maestros operativos pendientes',
    })),
    services: routes.map((route) => ({
      serviceId: `service-${route.id}`,
      routeCode: route.nombre,
      sequenceId: route.defaultSequenceId,
      dayType: 'por confirmar',
      startMinute: route.service?.startMinute ?? null,
      endMinute: route.service?.endMinute ?? null,
      headwayMinutes: route.service?.headwayMinutes ?? null,
      dispatchReferenceKind: route.service?.dispatchReferenceKind ?? 'none',
      dispatchReferenceMinute: route.service?.dispatchReferenceMinute ?? null,
      timezone: route.service?.timezone ?? 'America/Lima',
      source: route.service?.source ?? 'Sin perfil operativo vigente publicado',
      sourceDate: route.service?.sourceDate ?? '2026-09-14',
      evidenceStatus: route.service ? 'perfil documentado; ETA aún desactivado' : 'no encontrado; no habilita ETA',
    })),
    circuits: routes.map((route) => {
      const sequence = route.sequences[0];
      const routeGeometry = geometry.filter((row) => row.routeId === route.id);
      const start = sequence.coordinates[0];
      const end = sequence.coordinates.at(-1)!;
      return {
        routeCode: route.nombre,
        sequenceId: sequence.id,
        coordinateCount: sequence.coordinates.length,
        referenceCount: sequence.stops.length,
        layerCount: sequence.layers.length,
        startLatitude: start.latitude,
        startLongitude: start.longitude,
        endLatitude: end.latitude,
        endLongitude: end.longitude,
        closureDistanceMeters: round(haversineDistance(start, end), 3),
        closesExactly:
          start.latitude === end.latitude && start.longitude === end.longitude,
        circuitLengthMeters: routeGeometry.at(-1)?.cumulativeDistanceMeters ?? 0,
      };
    }),
    geometry,
    references: routes.flatMap((route) =>
      route.sequences[0].stops.map((stop) => ({
        referenceId: stop.id,
        routeCode: route.nombre,
        sequenceId: stop.sequenceId,
        publicName: stop.name,
        type: 'referencia visual no oficial',
        latitude: stop.coordinate.latitude,
        longitude: stop.coordinate.longitude,
        coordinateIndex: stop.coordinateIndex,
        order: stop.order,
        isOrigin: stop.isOrigin,
        isDestination: stop.isDestination,
        source: 'Muestreo uniforme de la geometría publicada',
        sourceDate: ROUTE_CATALOG_METADATA.geometrySourceDate,
        evidenceStatus: 'derivada; pendiente validación de paradero oficial',
      }))
    ),
    scope: {
      oe2CompletedWith: [
        'catálogo piloto 1A, D y 14',
        'circuitos dirigidos con cierre explícito',
        'coordenadas y distancias geométricas reproducibles',
        'referencias visuales derivadas y diferenciadas de paraderos oficiales',
        'Firestore como fuente maestra con cartographyReady=true y etaReady=false',
      ],
      requiresExternalEvidence: [
        'maestros oficiales de empresa, tarifa y vigencia',
        'horarios, frecuencias y despachos reales',
        'tiempos observados o velocidades calibradas por tramo',
      ],
      oe3Only: [
        'MAE',
        'RMSE',
        'sesgo',
        'cobertura dentro del umbral',
        'grupo focal y validación de campo',
      ],
    },
  };
}
