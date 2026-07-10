import { theme } from '../styles/global-styles';
import { ruta1A_Coordenadas } from '../utils/ruta1A';
import { ruta12_Coordenadas } from '../utils/ruta12';

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
  available: boolean;
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
    available: true,
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
    coordinates: null,
    available: true,
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
    available: true,
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
    available: true,
  },
  {
    id: '5',
    nombre: '10',
    descripcion: 'Expreso Ilo',
    origen: 'Miramar',
    destino: 'Nuevo Ilo',
    color: theme.colors.ruta10,
    empresa: 'Expreso Ilo',
    zona: 'Pampa',
    horario: '',
    tarifa: '',
    frecuencia: '',
    coordinates: null,
    available: false,
  },
];

export const getAllRoutes = (): Route[] => routes;

export const getAvailableRoutes = (): Route[] => routes.filter((r) => r.available);

export const getRouteByName = (nombre: string): Route | undefined =>
  routes.find((r) => r.nombre.toLowerCase() === nombre.toLowerCase());

export const getRouteCoordinates = (nombre: string): LatLng[] | null =>
  getRouteByName(nombre)?.coordinates ?? null;
