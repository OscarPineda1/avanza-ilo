import { buildDirectedRouteGraph, type TravelTimeProfile } from './graph';
import { getAllRoutes, type Route, type ServiceProfile } from './routes';

export const DEMO_DATA_VERSION = '2026-09-14-demo-oe1-oe2-v1';
export const DEMO_SOURCE =
  'Escenario de demostración AVANZA ILO; despachos y pesos simulados, no evidencia de campo.';

type DemoRouteParameters = {
  headwayMinutes: number;
  averageSpeedKmh: number;
  stopPenaltyMinutes: number;
};

const PARAMETERS: Record<string, DemoRouteParameters> = {
  '1A': { headwayMinutes: 10, averageSpeedKmh: 24, stopPenaltyMinutes: 0.25 },
  D: { headwayMinutes: 12, averageSpeedKmh: 22, stopPenaltyMinutes: 0.25 },
  '14': { headwayMinutes: 15, averageSpeedKmh: 25, stopPenaltyMinutes: 0.25 },
};

export function buildDemoService(routeName: string): ServiceProfile {
  const parameters = PARAMETERS[routeName];
  if (!parameters) throw new Error(`La ruta ${routeName} no pertenece al escenario de demostración.`);
  return {
    startMinute: 0,
    endMinute: 23 * 60 + 59,
    headwayMinutes: parameters.headwayMinutes,
    dispatchReferenceMinute: 6 * 60,
    dispatchReferenceKind: 'estimated',
    timezone: 'America/Lima',
    source: DEMO_SOURCE,
    sourceDate: '2026-09-14',
  };
}

export function buildDemoTravelProfile(routeName: string): TravelTimeProfile {
  const parameters = PARAMETERS[routeName];
  if (!parameters) throw new Error(`La ruta ${routeName} no pertenece al escenario de demostración.`);
  return {
    id: `demo-${routeName.toLowerCase()}-pesos-v1`,
    band: 'día completo · demostración',
    averageSpeedKmh: parameters.averageSpeedKmh,
    stopPenaltyMinutes: parameters.stopPenaltyMinutes,
    source: DEMO_SOURCE,
    sourceDate: '2026-09-14',
    evidence: 'synthetic',
    weightUnit: 'seconds',
  };
}

export function buildDemoRoutes(routes: Route[] = getAllRoutes()): Route[] {
  return routes.map((route) => {
    const service = buildDemoService(route.nombre);
    const travelProfile = buildDemoTravelProfile(route.nombre);
    return {
      ...route,
      horario: '00:00–23:59 · demostración',
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

export function validateDemoWeights(routes: Route[] = buildDemoRoutes()) {
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
