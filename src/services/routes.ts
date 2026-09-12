import { theme } from '../styles/theme';
import {
  ruta1A_Tramo1_Coordenadas,
  ruta1A_Tramo2_Coordenadas,
} from '../utils/ruta1a-my-maps';
import { rutaD_Coordenadas } from '../utils/ruta-d-my-maps';
import {
  ruta14_Tramo1_Coordenadas,
  ruta14_Tramo2_Coordenadas,
} from '../utils/ruta14-my-maps';
import type { Stop } from './stops';
import { validateRouteCatalog } from './route-catalog-validation';
import {
  createRouteSequence,
  type RouteSequence,
} from './route-sequences';
import {
  BASELINE_TRAVEL_PROFILE,
  type TravelTimeProfile,
} from './graph';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type Route = {
  id: string;
  nombre: string;
  descripcion: string;
  origen: string;
  destino: string;
  color: string;
  empresa: string;
  zona: string;
  horario: string;
  tarifa: string;
  frecuencia: string;
  coordinates: LatLng[] | null;
  stops: Stop[];
  available: boolean;
  pilot: boolean;
  sentido: string;
  defaultSequenceId: string;
  sequences: RouteSequence[];
  service: ServiceProfile;
  travelProfile: TravelTimeProfile;
};

export type ServiceProfile = {
  startMinute: number;
  endMinute: number;
  headwayMinutes: number;
  dispatchReferenceMinute: number | null;
  dispatchReferenceKind: 'none' | 'scheduled' | 'estimated';
  timezone: 'America/Lima';
  source: string;
  sourceDate: string;
};

export type RouteCatalogMetadata = {
  id: string;
  version: string;
  source: string;
  sourceDate: string;
  geometrySourceDate: string;
  approvedPilotRouteNames: string[];
  decision: string;
};

export const ROUTE_CATALOG_METADATA: RouteCatalogMetadata = {
  id: 'avanza-ilo-rutas-piloto',
  version: '2026-09-09-oe1-nucleo-v1',
  source:
    'Google My Maps, correccion del responsable de datos en HU-19 y aclaracion funcional de HU-20',
  sourceDate: '2026-09-09',
  geometrySourceDate: '2026-08-19',
  approvedPilotRouteNames: ['1A', 'D', '14'],
  decision:
    'El trazo incorporado inicialmente como ruta 12 pertenece a la ruta 14. Las rutas 1A, D y 14 son circuitos: completan su lazo y regresan al punto inicial por el mismo tramo compartido. Cada retorno se declara dentro de su secuencia; no se generan conexiones automaticas entre rutas.',
};

const SERVICE_SOURCE = 'Ficha operativa del catálogo piloto; fase de despacho pendiente de validación de campo';

const serviceProfiles: Record<'1A' | 'D' | '14', ServiceProfile> = {
  '1A': {
    startMinute: 6 * 60,
    endMinute: 21 * 60,
    headwayMinutes: 10,
    dispatchReferenceMinute: null,
    dispatchReferenceKind: 'none',
    timezone: 'America/Lima',
    source: SERVICE_SOURCE,
    sourceDate: '2026-09-09',
  },
  D: {
    startMinute: 6 * 60 + 15,
    endMinute: 20 * 60 + 45,
    headwayMinutes: 12,
    dispatchReferenceMinute: null,
    dispatchReferenceKind: 'none',
    timezone: 'America/Lima',
    source: SERVICE_SOURCE,
    sourceDate: '2026-09-09',
  },
  '14': {
    startMinute: 6 * 60,
    endMinute: 21 * 60,
    headwayMinutes: 15,
    dispatchReferenceMinute: null,
    dispatchReferenceKind: 'none',
    timezone: 'America/Lima',
    source: SERVICE_SOURCE,
    sourceDate: '2026-09-09',
  },
};

const RUTA_1A_CRUCE_REGRESO_INDEX = 324;
const ruta1A_RetornoTramoCompartido = ruta1A_Tramo1_Coordenadas
  .slice(0, RUTA_1A_CRUCE_REGRESO_INDEX)
  .reverse() as LatLng[];

const RUTA_D_CRUCE_REGRESO_INDEX = 410;
const rutaD_RetornoTramoCompartido = rutaD_Coordenadas
  .slice(0, RUTA_D_CRUCE_REGRESO_INDEX + 1)
  .reverse() as LatLng[];

const RUTA_14_CRUCE_REGRESO_INDEX = 386;
const ruta14_RetornoTramoCompartido = ruta14_Tramo1_Coordenadas
  .slice(0, RUTA_14_CRUCE_REGRESO_INDEX)
  .reverse() as LatLng[];

const ruta1ASequence = createRouteSequence('1A', 8, {
  id: '1a-publicado',
  label: 'Circuito Alto Ilo · vía Pampa Inalámbrica',
  kind: 'circuit',
  layers: [
    {
      id: '1a-tramo-1',
      sourceName: 'Google My Maps · Ruta 1A · Tramo 1',
      order: 0,
      coordinates: ruta1A_Tramo1_Coordenadas as LatLng[],
    },
    {
      id: '1a-tramo-2',
      sourceName: 'Google My Maps · Ruta 1A · Tramo 2',
      order: 1,
      coordinates: ruta1A_Tramo2_Coordenadas as LatLng[],
    },
    {
      id: '1a-retorno-tramo-compartido',
      sourceName: 'HU-20 · Retorno confirmado por el mismo tramo hacia Alto Ilo',
      order: 2,
      coordinates: ruta1A_RetornoTramoCompartido,
      visible: false,
    },
  ],
});

const rutaDSequence = createRouteSequence('D', 8, {
  id: 'd-publicado',
  label: 'Circuito Plaza de Armas · vía Ciudad Nueva',
  kind: 'circuit',
  layers: [
    {
      id: 'd-trazo-publicado',
      sourceName: 'Google My Maps · Ruta D',
      order: 0,
      coordinates: rutaD_Coordenadas as LatLng[],
    },
    {
      id: 'd-retorno-tramo-compartido',
      sourceName: 'HU-20 · Retorno confirmado por el mismo tramo hacia Plaza de Armas',
      order: 1,
      coordinates: rutaD_RetornoTramoCompartido,
      visible: false,
    },
  ],
});

const ruta14Sequence = createRouteSequence('14', 8, {
  id: '14-publicado',
  label: 'Circuito Mercado Pacocha · vía Tren al Sur',
  kind: 'circuit',
  layers: [
    {
      id: '14-tramo-1',
      sourceName: 'Google My Maps · Ruta 14 · Tramo 1',
      order: 0,
      coordinates: ruta14_Tramo1_Coordenadas as LatLng[],
    },
    {
      id: '14-tramo-2',
      sourceName: 'Google My Maps · Ruta 14 · Tramo 2',
      order: 1,
      coordinates: ruta14_Tramo2_Coordenadas as LatLng[],
    },
    {
      id: '14-retorno-tramo-compartido',
      sourceName: 'HU-20 · Retorno confirmado por el mismo tramo hacia Mercado Pacocha',
      order: 2,
      coordinates: ruta14_RetornoTramoCompartido,
      visible: false,
    },
  ],
});

const routes: Route[] = [
  {
    id: '1',
    nombre: '1A',
    descripcion: 'Consorcio Ilo 1A',
    origen: 'Alto Ilo',
    destino: 'Pampa Inalámbrica',
    color: theme.colors.ruta1A,
    empresa: 'Consorcio Ilo 1A',
    zona: 'Pampa',
    horario: '6:00 AM - 9:00 PM',
    tarifa: 'S/. 1.50',
    frecuencia: '10 min',
    coordinates: ruta1ASequence.coordinates,
    stops: ruta1ASequence.stops,
    available: true,
    pilot: true,
    sentido: ruta1ASequence.label,
    defaultSequenceId: ruta1ASequence.id,
    sequences: [ruta1ASequence],
    service: serviceProfiles['1A'],
    travelProfile: BASELINE_TRAVEL_PROFILE,
  },
  {
    id: '2',
    nombre: 'D',
    descripcion: 'Transportes Pampa I.',
    origen: 'Plaza de Armas',
    destino: 'Ciudad Nueva',
    color: theme.colors.rutaD,
    empresa: 'Transportes Pampa I.',
    zona: 'Centro',
    horario: '6:15 AM - 8:45 PM',
    tarifa: 'S/. 1.50',
    frecuencia: '12 min',
    coordinates: rutaDSequence.coordinates,
    stops: rutaDSequence.stops,
    available: true,
    pilot: true,
    sentido: rutaDSequence.label,
    defaultSequenceId: rutaDSequence.id,
    sequences: [rutaDSequence],
    service: serviceProfiles.D,
    travelProfile: BASELINE_TRAVEL_PROFILE,
  },
  {
    id: '4',
    nombre: '14',
    descripcion: 'Ruta Troncal 14',
    origen: 'Mercado Pacocha',
    destino: 'Tren al Sur',
    color: theme.colors.ruta14,
    empresa: 'Ruta Troncal 14',
    zona: 'Sur',
    horario: '6:00 AM - 9:00 PM',
    tarifa: 'S/. 1.70',
    frecuencia: '15 min',
    coordinates: ruta14Sequence.coordinates,
    stops: ruta14Sequence.stops,
    available: true,
    pilot: true,
    sentido: ruta14Sequence.label,
    defaultSequenceId: ruta14Sequence.id,
    sequences: [ruta14Sequence],
    service: serviceProfiles['14'],
    travelProfile: BASELINE_TRAVEL_PROFILE,
  },
];

const bundledCatalogValidation = validateRouteCatalog(
  routes,
  ROUTE_CATALOG_METADATA
);

if (!bundledCatalogValidation.valid) {
  throw new Error(
    `El catalogo de rutas incluido no es valido: ${bundledCatalogValidation.issues
      .map((issue) => issue.message)
      .join('; ')}`
  );
}

export const getAllRoutes = (): Route[] => routes;

export const getAvailableRoutes = (): Route[] => routes.filter((r) => r.available);

export const getPilotRoutes = (): Route[] => routes.filter((r) => r.pilot);

export const getRouteByName = (nombre: string): Route | undefined =>
  routes.find((r) => r.nombre.toLowerCase() === nombre.toLowerCase());

export const getRouteCoordinates = (
  nombre: string,
  sequenceId?: string
): LatLng[] | null => getRouteSequence(nombre, sequenceId)?.coordinates ?? null;

export const getRouteStops = (nombre: string, sequenceId?: string): Stop[] =>
  getRouteSequence(nombre, sequenceId)?.stops ?? [];

export function getRouteSequence(
  nombre: string,
  sequenceId?: string
): RouteSequence | undefined {
  const route = getRouteByName(nombre);
  if (!route) return undefined;

  const requestedId = sequenceId ?? route.defaultSequenceId;
  return route.sequences.find((sequence) => sequence.id === requestedId);
}
