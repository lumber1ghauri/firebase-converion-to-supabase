import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore as getFirestoreSdk, type Firestore } from 'firebase/firestore';

// This is the same config as in index.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase config not found, skipping initialization.");
    return { app: null, auth: null, db: null };
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestoreSdk(app);
  
  return { app, auth, db };
}

// Server-side safe getters
export function getAuthInstance() {
    if (!auth) {
        initializeFirebase();
    }
    return auth!;
}

export function getFirestoreInstance() {
    if (!db) {
        initializeFirebase();
    }
    return db!;
}
