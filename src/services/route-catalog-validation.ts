import { haversineDistance } from './haversine';
import { buildGraphFromStops } from './graph';
import type { Route, RouteCatalogMetadata } from './routes';

const ILO_BOUNDS = {
  minLatitude: -17.8,
  maxLatitude: -17.5,
  minLongitude: -71.5,
  maxLongitude: -71.1,
};

const MAX_ADJACENT_COORDINATE_DISTANCE_METERS = 2000;

export type CatalogValidationIssue = {
  code: string;
  message: string;
  routeId?: string;
};

export type CatalogValidationResult = {
  valid: boolean;
  issues: CatalogValidationIssue[];
  summary: {
    routes: number;
    pilots: number;
    coordinates: number;
    references: number;
    weights: number;
  };
};

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isCoordinateInIlo(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= ILO_BOUNDS.minLatitude &&
    latitude <= ILO_BOUNDS.maxLatitude &&
    longitude >= ILO_BOUNDS.minLongitude &&
    longitude <= ILO_BOUNDS.maxLongitude
  );
}

function parsePositiveMinutes(value: string): number | undefined {
  const match = value.match(/^\s*(\d+(?:\.\d+)?)\s*min(?:utos?)?\s*$/i);
  if (!match) return undefined;

  const minutes = Number(match[1]);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
}

function coordinateKey(latitude: number, longitude: number): string {
  return `${latitude},${longitude}`;
}

export function validateRouteCatalog(
  routes: Route[],
  metadata: RouteCatalogMetadata
): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];
  const routeIds = new Set<string>();
  const routeNames = new Set<string>();
  const referenceIds = new Set<string>();
  let coordinateCount = 0;
  let referenceCount = 0;
  let weightCount = 0;

  if (!isNonEmpty(metadata.id) || !isNonEmpty(metadata.version)) {
    issues.push({
      code: 'metadata.identity',
      message: 'El catalogo debe declarar ID y version.',
    });
  }

  if (!isNonEmpty(metadata.source) || !isIsoDate(metadata.sourceDate)) {
    issues.push({
      code: 'metadata.source',
      message: 'El catalogo debe declarar una fuente y su fecha en formato AAAA-MM-DD.',
    });
  }

  if (!isIsoDate(metadata.geometrySourceDate) || !isNonEmpty(metadata.decision)) {
    issues.push({
      code: 'metadata.decision',
      message: 'El catalogo debe documentar la fecha del trazo y la decision de catalogo.',
    });
  }

  for (const route of routes) {
    if (!isNonEmpty(route.id) || routeIds.has(route.id)) {
      issues.push({
        code: 'route.id',
        message: `ID de ruta ausente o duplicado: ${route.id || '(vacio)'}.`,
        routeId: route.id,
      });
    }
    routeIds.add(route.id);

    const normalizedName = route.nombre.trim().toUpperCase();
    if (!normalizedName || routeNames.has(normalizedName)) {
      issues.push({
        code: 'route.name',
        message: `Codigo de ruta ausente o duplicado: ${route.nombre || '(vacio)'}.`,
        routeId: route.id,
      });
    }
    routeNames.add(normalizedName);
  }

  const actualPilots = routes
    .filter((route) => route.pilot)
    .map((route) => route.nombre.toUpperCase())
    .sort();
  const approvedPilots = [...metadata.approvedPilotRouteNames]
    .map((name) => name.toUpperCase())
    .sort();

  if (JSON.stringify(actualPilots) !== JSON.stringify(approvedPilots)) {
    issues.push({
      code: 'pilots.mismatch',
      message: `Pilotos encontrados: ${actualPilots.join(', ')}; aprobados: ${approvedPilots.join(', ')}.`,
    });
  }

  for (const route of routes.filter((candidate) => candidate.pilot)) {
    if (!route.available) {
      issues.push({
        code: 'pilot.availability',
        message: `La ruta piloto ${route.nombre} no esta disponible.`,
        routeId: route.id,
      });
    }

    if (
      !isNonEmpty(route.origen) ||
      !isNonEmpty(route.destino) ||
      !isNonEmpty(route.sentido)
    ) {
      issues.push({
        code: 'pilot.direction',
        message: `La ruta piloto ${route.nombre} debe declarar origen, destino y sentido.`,
        routeId: route.id,
      });
    }

    if (parsePositiveMinutes(route.frecuencia) === undefined) {
      issues.push({
        code: 'pilot.frequency',
        message: `La frecuencia de la ruta ${route.nombre} debe ser positiva y expresarse en minutos.`,
        routeId: route.id,
      });
    }

    const coordinates = route.coordinates;
    if (!coordinates || coordinates.length < 2) {
      issues.push({
        code: 'pilot.coordinates',
        message: `La ruta piloto ${route.nombre} necesita al menos dos coordenadas ordenadas.`,
        routeId: route.id,
      });
      continue;
    }

    coordinateCount += coordinates.length;
    const coordinateIndexes = new Map<string, number[]>();

    coordinates.forEach((coordinate, index) => {
      if (!isCoordinateInIlo(coordinate.latitude, coordinate.longitude)) {
        issues.push({
          code: 'coordinate.bounds',
          message: `Coordenada ${index} de la ruta ${route.nombre} no es valida para Ilo.`,
          routeId: route.id,
        });
      }

      const key = coordinateKey(coordinate.latitude, coordinate.longitude);
      const indexes = coordinateIndexes.get(key) ?? [];
      indexes.push(index);
      coordinateIndexes.set(key, indexes);

      if (index === 0) return;

      const distance = haversineDistance(coordinates[index - 1], coordinate);

      if (
        !Number.isFinite(distance) ||
        distance <= 0 ||
        distance > MAX_ADJACENT_COORDINATE_DISTANCE_METERS
      ) {
        issues.push({
          code: 'coordinate.order-weight',
          message: `Segmento ${index - 1}-${index} de la ruta ${route.nombre} tiene orden o peso invalido.`,
          routeId: route.id,
        });
      }
    });

    if (route.stops.length < 2) {
      issues.push({
        code: 'references.missing',
        message: `La ruta piloto ${route.nombre} necesita puntos de referencia.`,
        routeId: route.id,
      });
      continue;
    }

    referenceCount += route.stops.length;
    let previousCoordinateIndex = -1;

    route.stops.forEach((reference, index) => {
      if (!isNonEmpty(reference.id) || referenceIds.has(reference.id)) {
        issues.push({
          code: 'reference.id',
          message: `ID de referencia ausente o duplicado en la ruta ${route.nombre}.`,
          routeId: route.id,
        });
      }
      referenceIds.add(reference.id);

      if (
        reference.routeName.toUpperCase() !== route.nombre.toUpperCase() ||
        reference.order !== index ||
        !isNonEmpty(reference.name)
      ) {
        issues.push({
          code: 'reference.order',
          message: `Referencia ${reference.id} de la ruta ${route.nombre} tiene ruta, nombre u orden inconsistente.`,
          routeId: route.id,
        });
      }

      const key = coordinateKey(
        reference.coordinate.latitude,
        reference.coordinate.longitude
      );
      const matchingIndex = (coordinateIndexes.get(key) ?? []).find(
        (candidateIndex) => candidateIndex > previousCoordinateIndex
      );

      if (matchingIndex === undefined) {
        issues.push({
          code: 'reference.direction',
          message: `Referencia ${reference.id} de la ruta ${route.nombre} no sigue el sentido del trazo.`,
          routeId: route.id,
        });
      } else {
        previousCoordinateIndex = matchingIndex;
      }

    });

    if (!route.stops[0].isOrigin || !route.stops.at(-1)?.isDestination) {
      issues.push({
        code: 'reference.endpoints',
        message: `Las referencias de la ruta ${route.nombre} no identifican correctamente inicio y final.`,
        routeId: route.id,
      });
    }

    const graph = buildGraphFromStops(route.stops);
    weightCount += graph.adjacency.length;
    graph.adjacency.forEach((edge) => {
      if (
        edge.to !== edge.from + 1 ||
        !Number.isFinite(edge.distance) ||
        edge.distance <= 0 ||
        !Number.isFinite(edge.weight) ||
        edge.weight <= 0
      ) {
        issues.push({
          code: 'graph.direction-weight',
          message: `La arista ${edge.from}-${edge.to} de la ruta ${route.nombre} no respeta el sentido o tiene peso invalido.`,
          routeId: route.id,
        });
      }
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    summary: {
      routes: routes.length,
      pilots: actualPilots.length,
      coordinates: coordinateCount,
      references: referenceCount,
      weights: weightCount,
    },
  };
}
