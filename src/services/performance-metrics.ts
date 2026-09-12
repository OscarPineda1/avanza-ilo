const applicationModuleLoadedAt = Date.now();
let appReadyRecorded = false;

/**
 * Marca el primer NavigationContainer listo. No contiene identificadores,
 * coordenadas ni datos de usuario; sirve para medir el inicio en Android.
 */
export function recordAppReady(
  nowMilliseconds = Date.now(),
  writer: (message: string) => void = console.info
): number | null {
  if (appReadyRecorded) return null;
  appReadyRecorded = true;
  const duration = Math.max(0, nowMilliseconds - applicationModuleLoadedAt);
  writer(`[AVANZA_METRIC] app_ready_ms=${duration}`);
  return duration;
}

export function resetAppReadyMetricForTests(): void {
  appReadyRecorded = false;
}
