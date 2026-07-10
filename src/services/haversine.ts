import { LatLng } from './routes';

const EARTH_RADIUS_METERS = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const latA = toRadians(a.latitude);
  const latB = toRadians(b.latitude);

  const sinDLat2 = Math.sin(dLat / 2);
  const sinDLon2 = Math.sin(dLon / 2);

  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinDLat2 * sinDLat2 +
          Math.cos(latA) * Math.cos(latB) * sinDLon2 * sinDLon2
      )
    );

  return EARTH_RADIUS_METERS * c;
}
