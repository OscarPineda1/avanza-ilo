import { haversineDistance } from './haversine';
import { buildDirectedRouteGraph } from './graph';
import {
  flattenRouteLayers,
  getLayerJoinDistance,
  MAX_LAYER_JOIN_DISTANCE_METERS,
  type RouteSequence,
} from './route-sequences';
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
  sequenceId?: string;
};

export type CatalogValidationResult = {
  valid: boolean;
  issues: CatalogValidationIssue[];
  summary: {
    routes: number;
    pilots: number;
    sequences: number;
    layers: number;
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

function coordinatesMatch(
  left: RouteSequence['coordinates'] | null,
  right: RouteSequence['coordinates'] | null
): boolean {
  if (!left || !right || left.length !== right.length) return false;

  return left.every(
    (coordinate, index) =>
      coordinate.latitude === right[index].latitude &&
      coordinate.longitude === right[index].longitude
  );
}

export function validateRouteCatalog(
  routes: Route[],
  metadata: RouteCatalogMetadata
): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];
  const routeIds = new Set<string>();
  const routeNames = new Set<string>();
  const sequenceIds = new Set<string>();
  const layerIds = new Set<string>();
  const referenceIds = new Set<string>();
  let sequenceCount = 0;
  let layerCount = 0;
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

  if (metadata.cartographyReady !== true || typeof metadata.etaReady !== 'boolean') {
    issues.push({
      code: 'metadata.readiness',
      message: 'El catálogo debe declarar cartografía disponible y el estado explícito del ETA.',
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

    const parsedFrequency = parsePositiveMinutes(route.frecuencia);
    const hasValidDispatchReference = route.service.dispatchReferenceKind === 'none'
      ? route.service.dispatchReferenceMinute === null
      : route.service.dispatchReferenceMinute !== null &&
        Number.isFinite(route.service.dispatchReferenceMinute);
    if (
      !Number.isFinite(route.service.startMinute) ||
      !Number.isFinite(route.service.endMinute) ||
      route.service.endMinute <= route.service.startMinute ||
      !Number.isFinite(route.service.headwayMinutes) ||
      route.service.headwayMinutes <= 0 ||
      !hasValidDispatchReference ||
      parsedFrequency !== route.service.headwayMinutes ||
      route.service.timezone !== 'America/Lima' ||
      !isNonEmpty(route.service.source) ||
      !isIsoDate(route.service.sourceDate)
    ) {
      issues.push({
        code: 'pilot.service-profile',
        message: `La ruta ${route.nombre} debe usar un único perfil de servicio válido y coherente con la frecuencia mostrada.`,
        routeId: route.id,
      });
    }

    if ((metadata.etaReady || route.travelProfile !== null) && (
      !isNonEmpty(route.travelProfile?.id) ||
      !Number.isFinite(route.travelProfile?.averageSpeedKmh) ||
      (route.travelProfile?.averageSpeedKmh ?? 0) <= 0 ||
      !Number.isFinite(route.travelProfile?.stopPenaltyMinutes) ||
      (route.travelProfile?.stopPenaltyMinutes ?? -1) < 0 ||
      !isNonEmpty(route.travelProfile?.source) ||
      route.travelProfile?.weightUnit !== 'seconds' ||
      !isIsoDate(route.travelProfile?.sourceDate)
    )) {
      issues.push({
        code: 'pilot.travel-profile',
        message: `La ruta ${route.nombre} debe declarar fuente, unidad y pesos temporales válidos.`,
        routeId: route.id,
      });
    }

    if (!Array.isArray(route.sequences) || route.sequences.length === 0) {
      issues.push({
        code: 'sequence.missing',
        message: `La ruta piloto ${route.nombre} necesita al menos una secuencia dirigida.`,
        routeId: route.id,
      });
      continue;
    }

    const defaultSequence = route.sequences.find(
      (sequence) => sequence.id === route.defaultSequenceId
    );

    if (!defaultSequence) {
      issues.push({
        code: 'sequence.default',
        message: `La ruta ${route.nombre} no identifica una secuencia predeterminada valida.`,
        routeId: route.id,
      });
    } else {
      if (!coordinatesMatch(route.coordinates, defaultSequence.coordinates)) {
        issues.push({
          code: 'sequence.default-coordinates',
          message: `La geometria visible de la ruta ${route.nombre} no coincide con su secuencia predeterminada.`,
          routeId: route.id,
          sequenceId: defaultSequence.id,
        });
      }

      if (
        route.stops.length !== defaultSequence.stops.length ||
        !route.stops.every(
          (stop, index) => stop.id === defaultSequence.stops[index]?.id
        )
      ) {
        issues.push({
          code: 'sequence.default-references',
          message: `Las referencias visibles de la ruta ${route.nombre} no conservan su secuencia predeterminada.`,
          routeId: route.id,
          sequenceId: defaultSequence.id,
        });
      }
    }

    for (const sequence of route.sequences) {
      sequenceCount += 1;

      if (!isNonEmpty(sequence.id) || sequenceIds.has(sequence.id)) {
        issues.push({
          code: 'sequence.id',
          message: `ID de secuencia ausente o duplicado en la ruta ${route.nombre}.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }
      sequenceIds.add(sequence.id);

      if (
        !isNonEmpty(sequence.label) ||
        (sequence.kind !== 'direction' && sequence.kind !== 'circuit')
      ) {
        issues.push({
          code: 'sequence.identity',
          message: `La secuencia ${sequence.id} debe declarar etiqueta y tipo.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }

      if (!Array.isArray(sequence.layers) || sequence.layers.length === 0) {
        issues.push({
          code: 'sequence.layers',
          message: `La secuencia ${sequence.id} no conserva capas de origen.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
        continue;
      }

      const sortedLayers = [...sequence.layers].sort(
        (left, right) => left.order - right.order
      );
      sortedLayers.forEach((layer, index) => {
        layerCount += 1;

        if (!isNonEmpty(layer.id) || layerIds.has(layer.id)) {
          issues.push({
            code: 'layer.id',
            message: `ID de capa ausente o duplicado en la secuencia ${sequence.id}.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        }
        layerIds.add(layer.id);

        if (
          layer.order !== index ||
          !isNonEmpty(layer.sourceName) ||
          !Array.isArray(layer.coordinates) ||
          layer.coordinates.length < 2
        ) {
          issues.push({
            code: 'layer.order-source',
            message: `La capa ${layer.id} de ${sequence.id} tiene orden, fuente o geometria invalida.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        }

        if (index > 0) {
          const joinDistance = getLayerJoinDistance(sortedLayers[index - 1], layer);
          if (
            !Number.isFinite(joinDistance) ||
            joinDistance > MAX_LAYER_JOIN_DISTANCE_METERS
          ) {
            issues.push({
              code: 'layer.disconnected',
              message: `Las capas ${sortedLayers[index - 1].id} y ${layer.id} no forman una secuencia continua.`,
              routeId: route.id,
              sequenceId: sequence.id,
            });
          }
        }
      });

      const flattenedCoordinates = flattenRouteLayers(sequence.layers);
      if (!coordinatesMatch(sequence.coordinates, flattenedCoordinates)) {
        issues.push({
          code: 'sequence.layer-order',
          message: `La secuencia ${sequence.id} no respeta el orden declarado de sus capas.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }

      const coordinates = sequence.coordinates;
      if (!coordinates || coordinates.length < 2) {
        issues.push({
          code: 'pilot.coordinates',
          message: `La secuencia ${sequence.id} necesita al menos dos coordenadas ordenadas.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
        continue;
      }

      coordinateCount += coordinates.length;
      const coordinateIndexes = new Map<string, number[]>();

      coordinates.forEach((coordinate, index) => {
        if (!isCoordinateInIlo(coordinate.latitude, coordinate.longitude)) {
          issues.push({
            code: 'coordinate.bounds',
            message: `Coordenada ${index} de la secuencia ${sequence.id} no es valida para Ilo.`,
            routeId: route.id,
            sequenceId: sequence.id,
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
            message: `Segmento ${index - 1}-${index} de ${sequence.id} tiene orden o peso invalido.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        }
      });

      if (
        sequence.kind === 'circuit' &&
        haversineDistance(coordinates[0], coordinates.at(-1)!) >
          MAX_LAYER_JOIN_DISTANCE_METERS
      ) {
        issues.push({
          code: 'sequence.circuit-open',
          message: `El circuito ${sequence.id} no incluye un cierre explicito en su secuencia.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }

      const sequenceStops = sequence.stops;
      if (sequenceStops.length < 2) {
        issues.push({
          code: 'references.missing',
          message: `La secuencia ${sequence.id} necesita puntos de referencia.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
        continue;
      }

      referenceCount += sequenceStops.length;
      let previousCoordinateIndex = -1;

      sequenceStops.forEach((reference, index) => {
        if (!isNonEmpty(reference.id) || referenceIds.has(reference.id)) {
          issues.push({
            code: 'reference.id',
            message: `ID de referencia ausente o duplicado en la secuencia ${sequence.id}.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        }
        referenceIds.add(reference.id);

        if (
          reference.routeName.toUpperCase() !== route.nombre.toUpperCase() ||
          reference.sequenceId !== sequence.id ||
          reference.order !== index ||
          !Number.isInteger(reference.coordinateIndex) ||
          !isNonEmpty(reference.name)
        ) {
          issues.push({
            code: 'reference.order',
            message: `Referencia ${reference.id} de ${sequence.id} tiene ruta, secuencia, nombre u orden inconsistente.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        }

        const key = coordinateKey(
          reference.coordinate.latitude,
          reference.coordinate.longitude
        );
        const matchingIndex = (coordinateIndexes.get(key) ?? []).find(
          (candidateIndex) => candidateIndex > previousCoordinateIndex
        );

        if (matchingIndex === undefined || matchingIndex !== reference.coordinateIndex) {
          issues.push({
            code: 'reference.direction',
            message: `Referencia ${reference.id} no sigue el sentido ${sequence.id}.`,
            routeId: route.id,
            sequenceId: sequence.id,
          });
        } else {
          previousCoordinateIndex = matchingIndex;
        }
      });

      if (
        !sequenceStops[0].isOrigin ||
        !sequenceStops.at(-1)?.isDestination
      ) {
        issues.push({
          code: 'reference.endpoints',
          message: `Las referencias de ${sequence.id} no identifican correctamente inicio y final.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }

      if (!route.travelProfile) continue;
      try {
        const graph = buildDirectedRouteGraph(
          sequence.coordinates,
          route.nombre,
          sequence.id,
          route.travelProfile,
          sequenceStops.map((stop) => stop.coordinateIndex)
        );
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
              message: `La arista ${edge.from}-${edge.to} de ${sequence.id} no respeta el sentido o tiene peso invalido.`,
              routeId: route.id,
              sequenceId: sequence.id,
            });
          }
        });
      } catch {
        issues.push({
          code: 'graph.direction-weight',
          message: `La secuencia ${sequence.id} no permite construir pesos dirigidos válidos.`,
          routeId: route.id,
          sequenceId: sequence.id,
        });
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    summary: {
      routes: routes.length,
      pilots: actualPilots.length,
      sequences: sequenceCount,
      layers: layerCount,
      coordinates: coordinateCount,
      references: referenceCount,
      weights: weightCount,
    },
  };
}
