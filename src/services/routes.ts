import { theme } from '../styles/theme';
import { ruta1A_Coordenadas } from '../utils/ruta1a-my-maps';
import { rutaD_Coordenadas } from '../utils/ruta-d-my-maps';
import { ruta12_Coordenadas } from '../utils/ruta12-my-maps';
import { buildStops } from './stops';
import type { Stop } from './stops';

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
  },
  {
    id: '3',
    nombre: '12',
    descripcion: 'Ruta Troncal 12',
    origen: 'Por definir',
    destino: 'Por definir',
    color: theme.colors.ruta12,
    empresa: 'Consorcio Ilo 12',
    zona: 'Sur',
    horario: '6:00 AM - 9:00 PM',
    tarifa: 'S/. 1.50',
    frecuencia: '10 min',
    coordinates: ruta12_Coordenadas as LatLng[],
    stops: buildStops('12', ruta12_Coordenadas as LatLng[], 8),
    available: true,
    pilot: true,
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
    coordinates: null,
    stops: [],
    available: true,
    // The route remains visible as static information until its official
    // geometric trace is supplied. It is not offered in the map quick list.
    pilot: false,
  },
];

export const getAllRoutes = (): Route[] => routes;

export const getAvailableRoutes = (): Route[] => routes.filter((r) => r.available);

export const getPilotRoutes = (): Route[] => routes.filter((r) => r.pilot);

export const getRouteByName = (nombre: string): Route | undefined =>
  routes.find((r) => r.nombre.toLowerCase() === nombre.toLowerCase());

export const getRouteCoordinates = (nombre: string): LatLng[] | null =>
  getRouteByName(nombre)?.coordinates ?? null;

export const getRouteStops = (nombre: string): Stop[] =>
  getRouteByName(nombre)?.stops ?? [];
