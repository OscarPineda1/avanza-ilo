import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

export class FirebaseConfigurationError extends Error {
  constructor(message = 'La configuración pública de Firebase está incompleta.') {
    super(message);
    this.name = 'FirebaseConfigurationError';
  }
}

let firestoreEmulatorConnected = false;

function publicFirebaseConfig() {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

export function getFirebaseApp(): FirebaseApp {
  const config = publicFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new FirebaseConfigurationError();
  }
  return getApps().length ? getApp() : initializeApp(config);
}

export function getPublicFirestore(): Firestore {
  const firestore = getFirestore(getFirebaseApp());
  if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true' && !firestoreEmulatorConnected) {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
    if (!host) throw new FirebaseConfigurationError('Falta EXPO_PUBLIC_FIREBASE_EMULATOR_HOST.');
    connectFirestoreEmulator(firestore, host, 8080);
    firestoreEmulatorConnected = true;
  }
  return firestore;
}
