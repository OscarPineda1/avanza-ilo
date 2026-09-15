import {
  buildDirectedRouteGraph,
  dijkstra,
  type Graph,
  type TravelTimeProfile,
} from './graph';
import {
  getRouteByName,
  getRouteSequence,
  ROUTE_CATALOG_METADATA,
  type ServiceProfile,
} from './routes';
import { positionFromStop, type RoutePosition } from './route-position';

export type EtaStatus =
  | 'arrival'
  | 'average-wait'
  | 'out-of-service'
  | 'unavailable';

export type EtaResult = {
  status: EtaStatus;
  minutes: number | null;
  estimatedArrival: string | null;
  queryTime: string;
  method: string;
  condition: string;
  dataVersion: string;
  travelMinutes: number | null;
  waitPointName: string;
};

export type ArrivalCandidateDecision =
  | 'discarded-before-query'
  | 'selected'
  | 'later';

export type ArrivalCandidate = {
  ordinal: number;
  departureMinute: number;
  arrivalMinute: number;
  departureTime: string;
  arrivalTime: string;
  alreadyDispatched: boolean;
  decision: ArrivalCandidateDecision;
};

const graphCache = new Map<string, Graph>();

export function parseFrequencyMinutes(frequency: string | undefined): number | undefined {
  if (!frequency) return undefined;
  const match = frequency.match(/^\s*(\d+(?:\.\d+)?)\s*min(?:utos?)?\s*$/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

export function formatMinuteOfDay(value: number): string {
  if (!Number.isFinite(value)) return '--:--';
  const normalized = ((Math.round(value) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

function hasCoherentDispatchReference(service: ServiceProfile): boolean {
  return service.dispatchReferenceKind === 'none'
    ? service.dispatchReferenceMinute === null
    : service.dispatchReferenceMinute !== null && Number.isFinite(service.dispatchReferenceMinute);
}

/**
 * HU-16: expande la fase de despacho dentro de la ventana de servicio y
 * clasifica cada arribo respecto de la hora de consulta. La unidad elegida
 * puede haber partido antes de la consulta si todavía no llegó al punto.
 */
export function buildArrivalCandidates(
  service: ServiceProfile,
  travelMinutes: number,
  queryMinute: number
): ArrivalCandidate[] {
  const reference = service.dispatchReferenceMinute;
  if (
    reference === null ||
    service.dispatchReferenceKind === 'none' ||
    !hasCoherentDispatchReference(service) ||
    !Number.isFinite(reference) ||
    !Number.isFinite(queryMinute) ||
    !Number.isFinite(travelMinutes) ||
    travelMinutes < 0 ||
    !Number.isFinite(service.startMinute) ||
    !Number.isFinite(service.endMinute) ||
    service.endMinute < service.startMinute ||
    !Number.isFinite(service.headwayMinutes) ||
    service.headwayMinutes <= 0
  ) return [];

  const firstPhaseIndex = Math.ceil(
    (service.startMinute - reference) / service.headwayMinutes
  );
  const lastPhaseIndex = Math.floor(
    (service.endMinute - reference) / service.headwayMinutes
  );
  let selected = false;
  const candidates: ArrivalCandidate[] = [];

  for (let index = firstPhaseIndex; index <= lastPhaseIndex; index += 1) {
    const departureMinute = reference + index * service.headwayMinutes;
    const arrivalMinute = departureMinute + travelMinutes;
    let decision: ArrivalCandidateDecision = 'later';
    if (arrivalMinute < queryMinute) {
      decision = 'discarded-before-query';
    } else if (!selected) {
      decision = 'selected';
      selected = true;
    }
    candidates.push({
      ordinal: candidates.length + 1,
      departureMinute,
      arrivalMinute,
      departureTime: formatMinuteOfDay(departureMinute),
      arrivalTime: formatMinuteOfDay(arrivalMinute),
      alreadyDispatched: departureMinute <= queryMinute,
      decision,
    });
  }

  return candidates;
}

function unavailable(
  status: Extract<EtaStatus, 'out-of-service' | 'unavailable'>,
  queryMinute: number,
  condition: string,
  waitPointName: string
): EtaResult {
  return {
    status,
    minutes: null,
    estimatedArrival: null,
    queryTime: formatMinuteOfDay(queryMinute),
    method: 'Sin cálculo',
    condition,
    dataVersion: ROUTE_CATALOG_METADATA.version,
    travelMinutes: null,
    waitPointName,
  };
}

export function inferArrivalFromService(
  service: ServiceProfile,
  travelMinutes: number,
  queryMinute: number,
  waitPointName: string,
  dataVersion = ROUTE_CATALOG_METADATA.version
): EtaResult {
  if (
    !Number.isFinite(queryMinute) ||
    !Number.isFinite(travelMinutes) ||
    travelMinutes < 0 ||
    !Number.isFinite(service.startMinute) ||
    !Number.isFinite(service.endMinute) ||
    service.endMinute < service.startMinute ||
    !Number.isFinite(service.headwayMinutes) ||
    service.headwayMinutes <= 0 ||
    !hasCoherentDispatchReference(service)
  ) {
    return unavailable('unavailable', queryMinute, 'Datos temporales o pesos inválidos.', waitPointName);
  }

  if (service.dispatchReferenceKind === 'none') {
    if (queryMinute < service.startMinute || queryMinute > service.endMinute) {
      return unavailable('out-of-service', queryMinute, 'Consulta fuera del horario declarado.', waitPointName);
    }
    return {
      status: 'average-wait',
      minutes: Math.round((service.headwayMinutes / 2) * 10) / 10,
      estimatedArrival: null,
      queryTime: formatMinuteOfDay(queryMinute),
      method: 'Frecuencia ÷ 2',
      condition: 'Espera promedio inferida; no existe una fase de despacho validada.',
      dataVersion,
      travelMinutes: Math.round(travelMinutes * 10) / 10,
      waitPointName,
    };
  }

  const candidates = buildArrivalCandidates(service, travelMinutes, queryMinute);
  const selectedCandidate = candidates.find((candidate) => candidate.decision === 'selected');
  if (!selectedCandidate) {
    return unavailable('out-of-service', queryMinute, 'La última unidad estimada ya pasó por este punto.', waitPointName);
  }
  const arrival = selectedCandidate.arrivalMinute;
  const minutes = Math.max(0, Math.round((arrival - queryMinute) * 10) / 10);

  return {
    status: 'arrival',
    minutes,
    estimatedArrival: formatMinuteOfDay(arrival),
    queryTime: formatMinuteOfDay(queryMinute),
    method: service.dispatchReferenceKind === 'scheduled'
      ? 'Llegadas candidatas desde salidas programadas'
      : 'Llegadas candidatas desde fase de despacho estimada',
    condition: service.dispatchReferenceKind === 'scheduled'
      ? 'Horario programado; no representa ubicación GPS.'
      : 'Fase inferida; no representa ubicación GPS.',
    dataVersion,
    travelMinutes: Math.round(travelMinutes * 10) / 10,
    waitPointName,
  };
}

function getGraph(
  routeName: string,
  sequenceId: string,
  profileOverride?: TravelTimeProfile
): Graph | null {
  const route = getRouteByName(routeName);
  const sequence = getRouteSequence(routeName, sequenceId);
  const profile = profileOverride ?? route?.travelProfile;
  if (!route || !sequence || !profile) return null;
  const key = `${routeName}:${sequenceId}:${profile.id}`;
  const cached = graphCache.get(key);
  if (cached) return cached;
  const graph = buildDirectedRouteGraph(
    sequence.coordinates,
    routeName,
    sequenceId,
    profile,
    sequence.stops.map((stop) => stop.coordinateIndex)
  );
  graphCache.set(key, graph);
  return graph;
}

export function travelMinutesToPosition(
  routeName: string,
  position: RoutePosition,
  profileOverride?: TravelTimeProfile
): number | null {
  const sequence = getRouteSequence(routeName, position.sequenceId);
  const graph = getGraph(routeName, position.sequenceId, profileOverride);
  if (
    !sequence ||
    !graph ||
    position.routeName.toUpperCase() !== routeName.toUpperCase() ||
    position.segmentIndex < 0 ||
    position.segmentIndex >= graph.adjacency.length ||
    !Number.isFinite(position.fraction) ||
    position.fraction < 0 ||
    position.fraction > 1
  ) return null;

  const distances = dijkstra(graph, 0);
  const edge = graph.adjacency[position.segmentIndex];
  const seconds = distances[position.segmentIndex] + edge.weight * position.fraction;
  return Number.isFinite(seconds) ? seconds / 60 : null;
}

export function computeEta(
  routeName: string,
  waitPoint: RoutePosition | string,
  queryMinute = minuteOfDay(new Date()),
  sequenceId?: string,
  serviceOverride?: ServiceProfile,
  travelProfileOverride?: TravelTimeProfile,
  dataVersion?: string
): EtaResult {
  const route = getRouteByName(routeName);
  const sequence = getRouteSequence(routeName, sequenceId);
  const fallbackName = typeof waitPoint === 'string' ? waitPoint : waitPoint.name;
  if (!route || !sequence) {
    return unavailable('unavailable', queryMinute, 'Ruta o sentido inexistente.', fallbackName);
  }

  const position = typeof waitPoint === 'string'
    ? sequence.stops.find((stop) => stop.id === waitPoint)
    : waitPoint;
  if (!position) {
    return unavailable('unavailable', queryMinute, 'El punto no pertenece a la ruta seleccionada.', fallbackName);
  }
  const routePosition = 'segmentIndex' in position
    ? position
    : positionFromStop(position, sequence);
  if (routePosition.sequenceId !== sequence.id || routePosition.routeName !== route.nombre) {
    return unavailable('unavailable', queryMinute, 'El punto no pertenece a la ruta y sentido seleccionados.', routePosition.name);
  }

  const travelMinutes = travelMinutesToPosition(routeName, routePosition, travelProfileOverride);
  if (travelMinutes === null) {
    return unavailable('unavailable', queryMinute, 'No existe un recorrido dirigido hasta este punto.', routePosition.name);
  }

  const service = serviceOverride ?? route.service;
  if (!service) {
    return unavailable('unavailable', queryMinute, 'No existe un perfil operativo validado para esta ruta.', routePosition.name);
  }

  return inferArrivalFromService(
    service,
    travelMinutes,
    queryMinute,
    routePosition.name,
    dataVersion
  );
}
