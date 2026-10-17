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
import { type TravelTimeProfile } from './graph';
import { OFFICIAL_STOPS_BY_ROUTE, OFFICIAL_STOPS_SOURCE } from './official-stops';

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
  service: ServiceProfile | null;
  travelProfile: TravelTimeProfile | null;
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
  cartographyReady: boolean;
  etaReady: boolean;
};

export const ROUTE_CATALOG_METADATA: RouteCatalogMetadata = {
  id: 'avanza-ilo-rutas-piloto',
  version: '2026-10-16-paraderos-oficiales-v1',
  source:
    `Google My Maps para la geometría. ${OFFICIAL_STOPS_SOURCE}`,
  sourceDate: '2026-10-16',
  geometrySourceDate: '2026-08-19',
  approvedPilotRouteNames: ['1A', 'D', '14'],
  decision:
    'Las rutas 1A, D y 14 conservan sus circuitos publicados e incorporan los paraderos oficiales y sus tiempos promedio de detención proporcionados por el responsable del proyecto. Los campos de operador, tarifa, horario, frecuencia y despacho permanecen sujetos a su evidencia operativa validada.',
  cartographyReady: true,
  etaReady: false,
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
  officialStops: OFFICIAL_STOPS_BY_ROUTE['1A'],
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
  officialStops: OFFICIAL_STOPS_BY_ROUTE.D,
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
  officialStops: OFFICIAL_STOPS_BY_ROUTE['14'],
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
    descripcion: 'Ruta 1A',
    origen: 'Alto Ilo',
    destino: 'Pampa Inalámbrica',
    color: theme.colors.ruta1A,
    empresa: 'Operador por confirmar',
    zona: 'Pampa',
    horario: '',
    tarifa: '',
    frecuencia: '',
    coordinates: ruta1ASequence.coordinates,
    stops: ruta1ASequence.stops,
    available: true,
    pilot: true,
    sentido: ruta1ASequence.label,
    defaultSequenceId: ruta1ASequence.id,
    sequences: [ruta1ASequence],
    service: null,
    travelProfile: null,
  },
  {
    id: '2',
    nombre: 'D',
    descripcion: 'Ruta D',
    origen: 'Plaza de Armas',
    destino: 'Ciudad Nueva',
    color: theme.colors.rutaD,
    empresa: 'Operador por confirmar',
    zona: 'Centro',
    horario: '',
    tarifa: '',
    frecuencia: '',
    coordinates: rutaDSequence.coordinates,
    stops: rutaDSequence.stops,
    available: true,
    pilot: true,
    sentido: rutaDSequence.label,
    defaultSequenceId: rutaDSequence.id,
    sequences: [rutaDSequence],
    service: null,
    travelProfile: null,
  },
  {
    id: '4',
    nombre: '14',
    descripcion: 'Ruta 14',
    origen: 'Mercado Pacocha',
    destino: 'Tren al Sur',
    color: theme.colors.ruta14,
    empresa: 'Operador por confirmar',
    zona: 'Sur',
    horario: '',
    tarifa: '',
    frecuencia: '',
    coordinates: ruta14Sequence.coordinates,
    stops: ruta14Sequence.stops,
    available: true,
    pilot: true,
    sentido: ruta14Sequence.label,
    defaultSequenceId: ruta14Sequence.id,
    sequences: [ruta14Sequence],
    service: null,
    travelProfile: null,
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
