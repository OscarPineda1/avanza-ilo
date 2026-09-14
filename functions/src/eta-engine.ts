import {
  OPERATION_TIME_ZONE,
  type Coordinate,
  type EtaRequest,
  type EtaResponse,
  type PublishedRoute,
  type PublishedSequence,
  type PublishedSnapshot,
} from './contracts.js';
import { validatePublishedSnapshot } from './snapshot-validator.js';

type Edge = { from: number; to: number; weightSeconds: number };

function distanceMeters(left: Coordinate, right: Coordinate): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLatitude = radians(right.latitude - left.latitude);
  const dLongitude = radians(right.longitude - left.longitude);
  const latitudeA = radians(left.latitude);
  const latitudeB = radians(right.latitude);
  const h = Math.sin(dLatitude / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(dLongitude / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function buildDirectedEdges(route: PublishedRoute, sequence: PublishedSequence): Edge[] {
  const profile = route.travelProfile;
  if (!profile) throw new Error('eta-profile-unavailable');
  const metersPerSecond = (profile.averageSpeedKmh * 1000) / 3600;
  const referenceIndexes = new Set(sequence.stops.map((reference) => reference.coordinateIndex));
  return sequence.coordinates.slice(0, -1).map((coordinate, index) => {
    const distance = distanceMeters(coordinate, sequence.coordinates[index + 1]);
    const stopPenalty = referenceIndexes.has(index + 1)
      ? profile.stopPenaltyMinutes * 60
      : 0;
    const weightSeconds = distance / metersPerSecond + stopPenalty;
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(weightSeconds) || weightSeconds < 0) {
      throw new Error(`invalid-edge:${index}`);
    }
    return { from: index, to: index + 1, weightSeconds };
  });
}

export function dijkstra(edges: Edge[], nodeCount: number, origin: number): number[] {
  const distances = new Array<number>(nodeCount).fill(Infinity);
  const adjacency = new Map<number, Edge[]>();
  for (const edge of edges) {
    const outgoing = adjacency.get(edge.from) ?? [];
    outgoing.push(edge);
    adjacency.set(edge.from, outgoing);
  }
  const heap: Array<{ node: number; distance: number }> = [];
  const push = (entry: { node: number; distance: number }) => {
    heap.push(entry);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[parent].distance <= heap[index].distance) break;
      [heap[parent], heap[index]] = [heap[index], heap[parent]];
      index = parent;
    }
  };
  const pop = () => {
    const first = heap[0];
    const last = heap.pop();
    if (heap.length && last) {
      heap[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < heap.length && heap[left].distance < heap[smallest].distance) smallest = left;
        if (right < heap.length && heap[right].distance < heap[smallest].distance) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        index = smallest;
      }
    }
    return first;
  };
  distances[origin] = 0;
  push({ node: origin, distance: 0 });
  while (heap.length) {
    const current = pop();
    if (!current || current.distance !== distances[current.node]) continue;
    for (const edge of adjacency.get(current.node) ?? []) {
      const candidate = current.distance + edge.weightSeconds;
      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate;
        push({ node: edge.to, distance: candidate });
      }
    }
  }
  return distances;
}

function minuteInLima(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: OPERATION_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? NaN);
  return value('hour') * 60 + value('minute') + value('second') / 60;
}

function baseResponse(dataVersion: string | null, note: string): EtaResponse {
  return {
    status: 'insufficient_data',
    etaMinutes: null,
    estimatedArrivalAt: null,
    method: 'none',
    dataVersion,
    assumptions: {
      timezone: OPERATION_TIME_ZONE,
      vehicleTracking: false,
      realTimeTraffic: false,
      occupancy: false,
      note,
    },
  };
}

function spatialMinutes(route: PublishedRoute, sequence: PublishedSequence, request: EtaRequest) {
  const reference = request.referenceId
    ? sequence.stops.find((candidate) => candidate.id === request.referenceId)
    : undefined;
  if (request.referenceId && !reference) return null;
  const segmentIndex = reference
    ? Math.min(reference.coordinateIndex, sequence.coordinates.length - 2)
    : request.waitPosition?.segmentIndex;
  const fraction = reference
    ? (reference.coordinateIndex === sequence.coordinates.length - 1 ? 1 : 0)
    : request.waitPosition?.fraction;
  if (
    !Number.isInteger(segmentIndex) ||
    segmentIndex === undefined ||
    segmentIndex < 0 ||
    segmentIndex >= sequence.coordinates.length - 1 ||
    !Number.isFinite(fraction) ||
    fraction === undefined ||
    fraction < 0 ||
    fraction > 1
  ) return null;
  const edges = buildDirectedEdges(route, sequence);
  const distances = dijkstra(edges, sequence.coordinates.length, 0);
  const seconds = distances[segmentIndex] + edges[segmentIndex].weightSeconds * fraction;
  if (!Number.isFinite(seconds)) return null;
  return {
    minutes: seconds / 60,
    name: reference?.name ?? 'Punto elegido sobre la ruta',
  };
}

export function validateEtaRequest(value: unknown): { valid: true; request: EtaRequest } | { valid: false; message: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, message: 'El cuerpo debe ser un objeto JSON.' };
  }
  const request = value as Partial<EtaRequest>;
  if (
    typeof request.routeId !== 'string' || request.routeId.length < 1 || request.routeId.length > 80 ||
    typeof request.directionId !== 'string' || request.directionId.length < 1 || request.directionId.length > 120 ||
    (request.expectedDataVersion !== undefined && (typeof request.expectedDataVersion !== 'string' || request.expectedDataVersion.length > 120))
  ) return { valid: false, message: 'routeId, directionId o expectedDataVersion no son válidos.' };
  const hasReference = typeof request.referenceId === 'string' && request.referenceId.length > 0 && request.referenceId.length <= 160;
  const position = request.waitPosition;
  const hasPosition = !!position
    && Number.isInteger(position.segmentIndex)
    && position.segmentIndex >= 0
    && Number.isFinite(position.fraction)
    && position.fraction >= 0
    && position.fraction <= 1;
  if (hasReference === hasPosition) {
    return { valid: false, message: 'Envía exactamente referenceId o waitPosition.' };
  }
  return { valid: true, request: request as EtaRequest };
}

export function inferEta(snapshot: PublishedSnapshot, request: EtaRequest, now: Date): EtaResponse {
  const validation = validatePublishedSnapshot(snapshot);
  if (!validation.valid) return baseResponse(snapshot?.dataVersion ?? null, 'El snapshot publicado no superó la validación integral.');
  if (request.expectedDataVersion && request.expectedDataVersion !== snapshot.dataVersion) {
    return { ...baseResponse(snapshot.dataVersion, 'Actualiza los datos estáticos antes de consultar nuevamente.'), status: 'version_mismatch' };
  }
  const route = snapshot.routes.find((candidate) => candidate.id === request.routeId && candidate.available);
  const sequence = route?.sequences.find((candidate) => candidate.id === request.directionId);
  if (!route || !sequence) {
    return { ...baseResponse(snapshot.dataVersion, 'La ruta o el sentido no pertenecen al snapshot publicado.'), status: 'no_route' };
  }
  if (!snapshot.etaReady || !route.travelProfile || !route.service) {
    return baseResponse(
      snapshot.dataVersion,
      'La cartografía está disponible, pero el ETA permanece desactivado hasta publicar pesos y despachos validados.'
    );
  }
  let spatial;
  try {
    spatial = spatialMinutes(route, sequence, request);
  } catch {
    spatial = null;
  }
  if (!spatial) {
    return { ...baseResponse(snapshot.dataVersion, 'El punto no pertenece al recorrido dirigido publicado.'), status: 'no_route' };
  }
  const queryMinute = minuteInLima(now);
  const service = route.service;
  const assumptions = {
    timezone: OPERATION_TIME_ZONE,
    waitPoint: spatial.name,
    travelProfileId: route.travelProfile.id,
    weightUnit: route.travelProfile.weightUnit,
    weightSource: route.travelProfile.source,
    weightEvidence: route.travelProfile.evidence,
    dispatchReferenceKind: service.dispatchReferenceKind,
    vehicleTracking: false as const,
    realTimeTraffic: false as const,
    occupancy: false as const,
    note: '',
  };
  if (queryMinute < service.startMinute || queryMinute > service.endMinute + spatial.minutes) {
    return {
      ...baseResponse(snapshot.dataVersion, 'Consulta fuera del horario o después del último recorrido candidato.'),
      status: 'out_of_service',
      assumptions,
    };
  }
  if (service.dispatchReferenceKind === 'none' || service.dispatchReferenceMinute === null) {
    const etaMinutes = Math.round((service.headwayMinutes / 2) * 10) / 10;
    return {
      status: 'average_wait',
      etaMinutes,
      estimatedArrivalAt: null,
      method: 'average_wait_from_published_headway',
      dataVersion: snapshot.dataVersion,
      assumptions: {
        ...assumptions,
        note: 'Espera promedio; no existe una referencia temporal de despacho validada.',
      },
    };
  }
  const firstIndex = Math.ceil((service.startMinute - service.dispatchReferenceMinute) / service.headwayMinutes);
  const lastIndex = Math.floor((service.endMinute - service.dispatchReferenceMinute) / service.headwayMinutes);
  let selectedArrival: number | null = null;
  for (let index = firstIndex; index <= lastIndex; index += 1) {
    const departure = service.dispatchReferenceMinute + index * service.headwayMinutes;
    const arrival = departure + spatial.minutes;
    if (arrival >= queryMinute) {
      selectedArrival = arrival;
      break;
    }
  }
  if (selectedArrival === null) {
    return { ...baseResponse(snapshot.dataVersion, 'La última llegada candidata ya pasó por el punto.'), status: 'out_of_service', assumptions };
  }
  const etaMinutes = Math.max(0, Math.round((selectedArrival - queryMinute) * 10) / 10);
  return {
    status: 'available',
    etaMinutes,
    estimatedArrivalAt: new Date(now.getTime() + etaMinutes * 60_000).toISOString(),
    method: 'directed_dijkstra_with_dispatch_candidates',
    dataVersion: snapshot.dataVersion,
    assumptions: {
      ...assumptions,
      note: service.dispatchReferenceKind === 'scheduled'
        ? 'Llegada calculada desde salidas programadas publicadas.'
        : 'Llegada calculada desde una fase de despacho estimada publicada.',
    },
  };
}
