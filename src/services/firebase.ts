import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore';

// Expo exposes variables prefixed with EXPO_PUBLIC_ to the mobile bundle.
// These values identify the Firebase project; access control remains in Firestore rules.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

function isConfigValid(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigValid()) {
    return null;
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirestoreInstance(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }
  if (!db) {
    db = getFirestore(firebaseApp);
  }
  return db;
}

export async function fetchRouteFrequency(routeName: string): Promise<number | null> {
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return null;
  }
  try {
    const snap = await getDoc(doc(firestore, 'frequencies', routeName));
    if (snap.exists()) {
      const data = snap.data();
      return typeof data.minutes === 'number' ? data.minutes : null;
    }
    return null;
  } catch {
    return null;
  }
}
