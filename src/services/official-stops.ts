import type { LatLng } from './routes';
import type { StopDirection } from './stops';

export type OfficialStopDefinition = {
  id: string;
  name: string;
  direction: StopDirection;
  dwellMinutes: number;
  coordinate: LatLng;
  coordinateIndex: number;
  sourceNote?: string;
};

export const OFFICIAL_STOPS_SOURCE =
  'Paraderos y tiempos promedio de detención proporcionados por el responsable del proyecto el 2026-10-16.';

export const OFFICIAL_STOPS_BY_ROUTE: Record<string, OfficialStopDefinition[]> = {
  '1A': [
    { id: '1a-oficial-01', name: 'Óvalo Nuevo Ilo', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.65044, longitude: -71.32882 }, coordinateIndex: 149 },
    { id: '1a-oficial-02', name: 'Plaza de Armas', direction: 'ida', dwellMinutes: 3, coordinate: { latitude: -17.64619, longitude: -71.34471 }, coordinateIndex: 327 },
    { id: '1a-oficial-03', name: 'Mercado Pacocha', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.64045, longitude: -71.34019 }, coordinateIndex: 360 },
    { id: '1a-oficial-04', name: 'Mercado Pacocha', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.63922, longitude: -71.33989 }, coordinateIndex: 547 },
    { id: '1a-oficial-05', name: 'Varadero', direction: 'vuelta', dwellMinutes: 3, coordinate: { latitude: -17.64534, longitude: -71.34615 }, coordinateIndex: 580 },
    { id: '1a-oficial-06', name: 'Coliseo', direction: 'vuelta', dwellMinutes: 3, coordinate: { latitude: -17.64753, longitude: -71.34421 }, coordinateIndex: 589 },
    { id: '1a-oficial-07', name: 'Óvalo Nuevo Ilo', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.65044, longitude: -71.32882 }, coordinateIndex: 764 },
  ],
  D: [
    { id: 'd-oficial-01', name: 'Óvalo Nuevo Ilo', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.65094, longitude: -71.32904 }, coordinateIndex: 108 },
    { id: 'd-oficial-02', name: 'Senati', direction: 'ida', dwellMinutes: 3, coordinate: { latitude: -17.65892, longitude: -71.33251 }, coordinateIndex: 238 },
    { id: 'd-oficial-03', name: 'Plaza de Armas', direction: 'ida', dwellMinutes: 3, coordinate: { latitude: -17.64619, longitude: -71.34471 }, coordinateIndex: 413 },
    { id: 'd-oficial-04', name: 'Mercado Pacocha', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.64045, longitude: -71.34019 }, coordinateIndex: 446 },
    { id: 'd-oficial-05', name: 'Mercado Pacocha', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.63922, longitude: -71.33989 }, coordinateIndex: 617 },
    { id: 'd-oficial-06', name: 'Varadero', direction: 'vuelta', dwellMinutes: 3, coordinate: { latitude: -17.64534, longitude: -71.34615 }, coordinateIndex: 650 },
    { id: 'd-oficial-07', name: 'Coliseo', direction: 'vuelta', dwellMinutes: 3, coordinate: { latitude: -17.64753, longitude: -71.34421 }, coordinateIndex: 657 },
    {
      id: 'd-oficial-08', name: 'Senati', direction: 'vuelta', dwellMinutes: 3,
      coordinate: { latitude: -17.65892, longitude: -71.33251 }, coordinateIndex: 831,
      sourceNote: 'Coordenada corregida y confirmada por el responsable del proyecto el 2026-10-16.',
    },
    { id: 'd-oficial-09', name: 'Óvalo Nuevo Ilo', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.65094, longitude: -71.32904 }, coordinateIndex: 961 },
  ],
  '14': [
    { id: '14-oficial-01', name: 'Óvalo Nuevo Ilo', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.65017, longitude: -71.32884 }, coordinateIndex: 133 },
    { id: '14-oficial-02', name: 'Plaza de Armas', direction: 'ida', dwellMinutes: 3, coordinate: { latitude: -17.64619, longitude: -71.34471 }, coordinateIndex: 389 },
    { id: '14-oficial-03', name: 'Mercado Pacocha', direction: 'ida', dwellMinutes: 5, coordinate: { latitude: -17.64046, longitude: -71.3402 }, coordinateIndex: 422 },
    { id: '14-oficial-04', name: 'Mercado Pacocha', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.63925, longitude: -71.3399 }, coordinateIndex: 621 },
    { id: '14-oficial-05', name: 'Varadero', direction: 'vuelta', dwellMinutes: 3, coordinate: { latitude: -17.64534, longitude: -71.34615 }, coordinateIndex: 655 },
    { id: '14-oficial-06', name: 'Óvalo Nuevo Ilo', direction: 'vuelta', dwellMinutes: 5, coordinate: { latitude: -17.65046, longitude: -71.32934 }, coordinateIndex: 909 },
  ],
};
