import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore';

// Replace these values with the project's Firebase config before using Cloud Firestore.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
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
