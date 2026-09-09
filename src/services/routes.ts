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
  version: '2026-09-09-hu20',
  source: 'Google My Maps y correccion del responsable de datos en HU-19',
  sourceDate: '2026-09-09',
  geometrySourceDate: '2026-08-19',
  approvedPilotRouteNames: ['1A', 'D', '14'],
  decision:
    'El trazo incorporado inicialmente como ruta 12 pertenece a la ruta 14. Cada recorrido conserva las capas y el sentido publicados en Google My Maps; no se generan recorridos inversos ni conexiones entre rutas.',
};

const ruta1ASequence = createRouteSequence('1A', 8, {
  id: '1a-publicado',
  label: 'Alto Ilo hacia Pampa Inalámbrica',
  kind: 'direction',
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
  ],
});

const rutaDSequence = createRouteSequence('D', 8, {
  id: 'd-publicado',
  label: 'Plaza de Armas hacia Ciudad Nueva',
  kind: 'direction',
  layers: [
    {
      id: 'd-trazo-publicado',
      sourceName: 'Google My Maps · Ruta D',
      order: 0,
      coordinates: rutaD_Coordenadas as LatLng[],
    },
  ],
});

const ruta14Sequence = createRouteSequence('14', 8, {
  id: '14-publicado',
  label: 'Mercado Pacocha hacia Tren al Sur',
  kind: 'direction',
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
