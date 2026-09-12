import type { TravelTimeProfile } from './graph';

export type TravelObservation = {
  id: string;
  routeName: string;
  sequenceId: string;
  band: string;
  distanceMeters: number;
  durationMinutes: number;
  includesStops: boolean;
  observedAt: string;
  dataset: 'calibration' | 'test';
};

export type CalibrationResult = {
  profile: TravelTimeProfile;
  observationIds: string[];
};

export function calibrateTravelProfile(
  observations: TravelObservation[],
  profileId: string,
  sourceDate: string
): CalibrationResult {
  const calibration = observations.filter((item) => item.dataset === 'calibration');
  if (calibration.length === 0) {
    throw new Error('La calibración requiere observaciones reservadas para calibración.');
  }
  if (calibration.some((item) =>
    !Number.isFinite(item.distanceMeters) ||
    item.distanceMeters <= 0 ||
    !Number.isFinite(item.durationMinutes) ||
    item.durationMinutes <= 0 ||
    !item.includesStops
  )) {
    throw new Error('Cada observación debe ser positiva e incluir las detenciones del recorrido.');
  }

  const totalDistanceKm = calibration.reduce((sum, item) => sum + item.distanceMeters, 0) / 1000;
  const totalHours = calibration.reduce((sum, item) => sum + item.durationMinutes, 0) / 60;
  const averageSpeedKmh = totalDistanceKm / totalHours;

  return {
    profile: {
      id: profileId,
      band: calibration[0].band,
      averageSpeedKmh,
      stopPenaltyMinutes: 0,
      source: `Calibración manual: ${calibration.map((item) => item.id).join(', ')}`,
      sourceDate,
      evidence: 'field',
      weightUnit: 'seconds',
    },
    observationIds: calibration.map((item) => item.id),
  };
}

export function absoluteErrorMinutes(
  expectedMinutes: number,
  actualMinutes: number
): number {
  if (!Number.isFinite(expectedMinutes) || !Number.isFinite(actualMinutes)) {
    throw new Error('Los tiempos de prueba deben ser finitos.');
  }
  return Math.abs(expectedMinutes - actualMinutes);
}
