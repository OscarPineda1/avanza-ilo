import { theme } from '../styles/theme';
import { ruta1A_Coordenadas } from '../utils/ruta1a-my-maps';
import { rutaD_Coordenadas } from '../utils/ruta-d-my-maps';
import { ruta14_Coordenadas } from '../utils/ruta14-my-maps';
import { buildStops } from './stops';
import type { Stop } from './stops';
import { validateRouteCatalog } from './route-catalog-validation';

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
  version: '2026-09-09',
  source: 'Google My Maps y correccion del responsable de datos en HU-19',
  sourceDate: '2026-09-09',
  geometrySourceDate: '2026-08-19',
  approvedPilotRouteNames: ['1A', 'D', '14'],
  decision:
    'El trazo incorporado inicialmente como ruta 12 pertenece a la ruta 14. Se conserva el ID 4 que ya identificaba a la ruta 14 y se retira la entrada 12 del catalogo aprobado.',
};

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
    coordinates: ruta1A_Coordenadas as LatLng[],
    stops: buildStops('1A', ruta1A_Coordenadas as LatLng[], 8),
    available: true,
    pilot: true,
    sentido: 'Secuencia completa publicada en Google My Maps',
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
    coordinates: rutaD_Coordenadas as LatLng[],
    stops: buildStops('D', rutaD_Coordenadas as LatLng[], 8),
    available: true,
    pilot: true,
    sentido: 'Secuencia completa publicada en Google My Maps',
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
    coordinates: ruta14_Coordenadas as LatLng[],
    stops: buildStops('14', ruta14_Coordenadas as LatLng[], 8),
    available: true,
    pilot: true,
    sentido: 'Secuencia completa publicada en Google My Maps',
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

export const getRouteCoordinates = (nombre: string): LatLng[] | null =>
  getRouteByName(nombre)?.coordinates ?? null;

export const getRouteStops = (nombre: string): Stop[] =>
  getRouteByName(nombre)?.stops ?? [];
