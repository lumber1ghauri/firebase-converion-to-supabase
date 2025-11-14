
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth as getAuthSdk, type Auth } from 'firebase/auth';
import { getFirestore as getFirestoreSdk, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase config not found, skipping initialization.");
    // This is a guard clause for when Firebase is not configured.
    // In a real app, you'd want to handle this more gracefully.
    // For now, we return nulls and the client provider will show a loader.
    return { app: null, auth: null, db: null };
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuthSdk(app);
  db = getFirestoreSdk(app);

  return { app, auth, db };
}


function getFirebaseInstances() {
    if (!app) {
        // This will initialize the app if it hasn't been already.
        // This is useful for server-side actions that might run before client-side initialization.
        initializeFirebase();
    }
    return { app, auth, db };
}


// These are helper functions to be used in server-side code (e.g. server actions)
// to ensure they get the initialized firebase instances.
export function getFirebaseApp() {
    return getFirebaseInstances().app;
}
export function getAuth() {
    return getFirebaseInstances().auth;
}
export function getFirestore() {
    return getFirebaseInstances().db;
}
