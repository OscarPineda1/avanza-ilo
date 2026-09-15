import { buildDirectedRouteGraph, type TravelTimeProfile } from './graph';
import { getAllRoutes, type Route, type ServiceProfile } from './routes';

export const VALIDATED_OPERATIONAL_DATA_VERSION = '2026-09-15-oe1-oe2-validado-v1';
export const VALIDATED_OPERATIONAL_SOURCE =
  'Matriz operativa OE1/OE2 AVANZA ILO del 2026-09-14; pesos y despachos validados por el responsable del proyecto y Joshua.';
export const VALIDATED_OPERATIONAL_DECISION =
  'Se habilita el ETA con la cartografía publicada de las rutas 1A, D y 14 y la línea base operativa de pesos y despachos aprobada por el responsable del proyecto y Joshua el 2026-09-15.';

type ValidatedRouteParameters = {
  headwayMinutes: number;
  averageSpeedKmh: number;
  stopPenaltyMinutes: number;
};

const PARAMETERS: Record<string, ValidatedRouteParameters> = {
  '1A': { headwayMinutes: 10, averageSpeedKmh: 24, stopPenaltyMinutes: 0.25 },
  D: { headwayMinutes: 12, averageSpeedKmh: 22, stopPenaltyMinutes: 0.25 },
  '14': { headwayMinutes: 15, averageSpeedKmh: 25, stopPenaltyMinutes: 0.25 },
};

export function buildValidatedService(routeName: string): ServiceProfile {
  const parameters = PARAMETERS[routeName];
  if (!parameters) throw new Error(`La ruta ${routeName} no pertenece al conjunto operativo validado.`);
  return {
    startMinute: 0,
    endMinute: 23 * 60 + 59,
    headwayMinutes: parameters.headwayMinutes,
    dispatchReferenceMinute: 6 * 60,
    dispatchReferenceKind: 'scheduled',
    timezone: 'America/Lima',
    source: VALIDATED_OPERATIONAL_SOURCE,
    sourceDate: '2026-09-15',
  };
}

export function buildValidatedTravelProfile(routeName: string): TravelTimeProfile {
  const parameters = PARAMETERS[routeName];
  if (!parameters) throw new Error(`La ruta ${routeName} no pertenece al conjunto operativo validado.`);
  return {
    id: `oe1-oe2-${routeName.toLowerCase()}-pesos-validados-v1`,
    band: 'día completo',
    averageSpeedKmh: parameters.averageSpeedKmh,
    stopPenaltyMinutes: parameters.stopPenaltyMinutes,
    source: VALIDATED_OPERATIONAL_SOURCE,
    sourceDate: '2026-09-15',
    evidence: 'validated',
    weightUnit: 'seconds',
  };
}

export function buildValidatedOperationalRoutes(routes: Route[] = getAllRoutes()): Route[] {
  return routes.map((route) => {
    const service = buildValidatedService(route.nombre);
    const travelProfile = buildValidatedTravelProfile(route.nombre);
    return {
      ...route,
      horario: '00:00–23:59',
      frecuencia: `${service.headwayMinutes} min`,
      service,
      travelProfile,
      sequences: route.sequences.map((sequence) => ({
        ...sequence,
        stops: sequence.stops.map((stop) => ({ ...stop })),
      })),
      stops: route.stops.map((stop) => ({ ...stop })),
    };
  });
}

export function validateOperationalWeights(routes: Route[] = buildValidatedOperationalRoutes()) {
  return routes.map((route) => {
    const sequence = route.sequences[0];
    const graph = buildDirectedRouteGraph(
      sequence.coordinates,
      route.nombre,
      sequence.id,
      route.travelProfile!,
      sequence.stops.map((stop) => stop.coordinateIndex)
    );
    return {
      routeName: route.nombre,
      edgeCount: graph.adjacency.length,
      allFiniteNonNegative: graph.adjacency.every(
        (edge) => Number.isFinite(edge.weight) && edge.weight >= 0
      ),
    };
  });
}
