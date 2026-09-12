import {
  OPERATION_TIME_ZONE,
  type PublishedSnapshot,
  type SnapshotValidation,
  type ValidationIssue,
} from './contracts.js';

const ILO_BOUNDS = {
  minLatitude: -17.8,
  maxLatitude: -17.5,
  minLongitude: -71.5,
  maxLongitude: -71.1,
};

// Firestore limita cada documento a 1 MiB. Dejamos margen para codificación y
// metadatos internos antes de iniciar cualquier transacción de publicación.
const MAX_SAFE_SNAPSHOT_BYTES = 900_000;

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validatePublishedSnapshot(snapshot: PublishedSnapshot): SnapshotValidation {
  const issues: ValidationIssue[] = [];
  const routeIds = new Set<string>();
  const routeNames = new Set<string>();
  const directionIds = new Set<string>();
  const referenceIds = new Set<string>();
  let directions = 0;
  let coordinates = 0;
  let references = 0;
  let edges = 0;

  try {
    const serializedBytes = new TextEncoder().encode(JSON.stringify(snapshot)).byteLength;
    if (serializedBytes > MAX_SAFE_SNAPSHOT_BYTES) {
      issues.push({ code: 'snapshot.size', message: `El snapshot ocupa ${serializedBytes} bytes y supera el límite seguro de publicación.` });
    }
  } catch {
    issues.push({ code: 'snapshot.serialization', message: 'El snapshot no se puede serializar de forma segura.' });
  }

  if (
    snapshot?.schemaVersion !== 1 ||
    snapshot?.status !== 'published' ||
    !nonEmpty(snapshot?.dataVersion) ||
    !nonEmpty(snapshot?.source) ||
    !isoDate(snapshot?.sourceDate) ||
    !isoDate(snapshot?.geometrySourceDate) ||
    !nonEmpty(snapshot?.decision) ||
    !nonEmpty(snapshot?.publishedBy) ||
    Number.isNaN(Date.parse(snapshot?.publishedAt))
  ) {
    issues.push({ code: 'snapshot.metadata', message: 'El snapshot no tiene metadatos publicables completos.' });
  }

  if (!Array.isArray(snapshot?.routes)) {
    return {
      valid: false,
      issues: [...issues, { code: 'snapshot.routes', message: 'El snapshot no contiene rutas.' }],
      summary: { routes: 0, directions: 0, coordinates: 0, references: 0, edges: 0 },
    };
  }

  const pilots = snapshot.routes.filter((route) => route.pilot).map((route) => route.nombre.toUpperCase()).sort();
  if (JSON.stringify(pilots) !== JSON.stringify(['14', '1A', 'D'])) {
    issues.push({ code: 'snapshot.pilots', message: `Los pilotos publicados deben ser 1A, D y 14; se recibieron ${pilots.join(', ')}.` });
  }

  for (const route of snapshot.routes) {
    const routeName = route.nombre?.trim().toUpperCase();
    if (!nonEmpty(route.id) || routeIds.has(route.id)) {
      issues.push({ code: 'route.id', message: 'El ID de ruta falta o está duplicado.', routeId: route.id });
    }
    routeIds.add(route.id);
    if (!routeName || routeNames.has(routeName) || routeName === '12') {
      issues.push({ code: 'route.name', message: 'El código de ruta falta, está duplicado o no pertenece al catálogo final.', routeId: route.id });
    }
    routeNames.add(routeName);

    const service = route.service;
    const validDispatch = service?.dispatchReferenceKind === 'none'
      ? service.dispatchReferenceMinute === null
      : finite(service?.dispatchReferenceMinute);
    if (
      !finite(service?.startMinute) ||
      !finite(service?.endMinute) ||
      service.endMinute <= service.startMinute ||
      !finite(service?.headwayMinutes) ||
      service.headwayMinutes <= 0 ||
      !validDispatch ||
      service?.timezone !== OPERATION_TIME_ZONE ||
      !nonEmpty(service?.source) ||
      !isoDate(service?.sourceDate)
    ) {
      issues.push({ code: 'route.service', message: 'El perfil de servicio es incompleto o inválido.', routeId: route.id });
    }

    const profile = route.travelProfile;
    if (
      !nonEmpty(profile?.id) ||
      !finite(profile?.averageSpeedKmh) ||
      profile.averageSpeedKmh <= 0 ||
      !finite(profile?.stopPenaltyMinutes) ||
      profile.stopPenaltyMinutes < 0 ||
      profile?.weightUnit !== 'seconds' ||
      !nonEmpty(profile?.source) ||
      !isoDate(profile?.sourceDate) ||
      !['field', 'synthetic', 'assumption'].includes(profile?.evidence)
    ) {
      issues.push({ code: 'route.weights', message: 'El perfil de pesos carece de unidad, fuente o valores válidos.', routeId: route.id });
    }

    if (!Array.isArray(route.sequences) || route.sequences.length === 0) {
      issues.push({ code: 'route.directions', message: 'La ruta no contiene sentidos o circuitos.', routeId: route.id });
      continue;
    }
    if (!route.sequences.some((sequence) => sequence.id === route.defaultSequenceId)) {
      issues.push({ code: 'route.default-direction', message: 'El sentido predeterminado no existe.', routeId: route.id });
    }

    for (const sequence of route.sequences) {
      directions += 1;
      if (!nonEmpty(sequence.id) || directionIds.has(sequence.id)) {
        issues.push({ code: 'direction.id', message: 'El directionId falta o está duplicado.', routeId: route.id, directionId: sequence.id });
      }
      directionIds.add(sequence.id);
      if (!Array.isArray(sequence.coordinates) || sequence.coordinates.length < 2) {
        issues.push({ code: 'direction.geometry', message: 'La geometría dirigida está vacía.', routeId: route.id, directionId: sequence.id });
        continue;
      }
      coordinates += sequence.coordinates.length;
      edges += sequence.coordinates.length - 1;
      sequence.coordinates.forEach((coordinate, index) => {
        if (
          !finite(coordinate.latitude) ||
          !finite(coordinate.longitude) ||
          coordinate.latitude < ILO_BOUNDS.minLatitude ||
          coordinate.latitude > ILO_BOUNDS.maxLatitude ||
          coordinate.longitude < ILO_BOUNDS.minLongitude ||
          coordinate.longitude > ILO_BOUNDS.maxLongitude
        ) {
          issues.push({ code: 'direction.coordinate', message: `La coordenada ${index} no es válida para Ilo.`, routeId: route.id, directionId: sequence.id });
        }
      });
      if (!Array.isArray(sequence.stops) || sequence.stops.length < 2) {
        issues.push({ code: 'direction.references', message: 'La secuencia necesita referencias de consulta.', routeId: route.id, directionId: sequence.id });
        continue;
      }
      let previousIndex = -1;
      sequence.stops.forEach((reference, index) => {
        references += 1;
        if (!nonEmpty(reference.id) || referenceIds.has(reference.id)) {
          issues.push({ code: 'reference.id', message: 'La referencia falta o está duplicada.', routeId: route.id, directionId: sequence.id });
        }
        referenceIds.add(reference.id);
        if (
          reference.routeName !== route.nombre ||
          reference.sequenceId !== sequence.id ||
          reference.order !== index ||
          !Number.isInteger(reference.coordinateIndex) ||
          reference.coordinateIndex <= previousIndex ||
          reference.coordinateIndex < 0 ||
          reference.coordinateIndex >= sequence.coordinates.length
        ) {
          issues.push({ code: 'reference.sequence', message: 'La referencia no conserva ruta, sentido u orden.', routeId: route.id, directionId: sequence.id });
        }
        previousIndex = reference.coordinateIndex;
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    summary: { routes: snapshot.routes.length, directions, coordinates, references, edges },
  };
}
