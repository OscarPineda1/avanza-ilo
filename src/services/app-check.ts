import { Platform } from 'react-native';

import { configureAppCheckTokenProvider } from './eta';

export type AppCheckBootstrapStatus =
  | 'configured'
  | 'emulator'
  | 'unsupported';

let bootstrap: Promise<AppCheckBootstrapStatus> | null = null;

/**
 * Configura App Check antes de que el usuario pueda consultar el endpoint ETA.
 * En Expo Go no existe el módulo nativo; el cliente conserva el cierre seguro y
 * nunca envía una solicitud productiva sin token.
 */
export function initializeAppCheckProtection(): Promise<AppCheckBootstrapStatus> {
  if (bootstrap) return bootstrap;

  bootstrap = (async () => {
    if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true') return 'emulator';
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return 'unsupported';

    const [{ getApp }, appCheckModule] = await Promise.all([
      import('@react-native-firebase/app'),
      import('@react-native-firebase/app-check'),
    ]);
    const provider = new appCheckModule.ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
      apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback' },
    });
    const appCheck = await appCheckModule.initializeAppCheck(getApp(), {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    // Fuerza el primer intercambio en development builds para que Firebase
    // emita el token debug en logcat y pueda registrarse sin guardarlo en Git.
    if (__DEV__) {
      void appCheckModule.getToken(appCheck, false).catch(() => {
        console.warn('[AVANZA_APP_CHECK] debug_token_pending_registration');
      });
    }

    configureAppCheckTokenProvider(async () => {
      try {
        return (await appCheckModule.getToken(appCheck, false)).token || null;
      } catch {
        return null;
      }
    });
    return 'configured';
  })();

  return bootstrap;
}
