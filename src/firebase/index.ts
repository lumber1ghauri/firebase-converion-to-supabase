import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore as getFirestoreSdk, type Firestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual Firebase config from your Firebase project settings
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
    auth = getAuth(app);
    db = getFirestoreSdk(app);
  } else if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    db = getFirestoreSdk(app);
  }
  return { app, auth, db };
}

// Client-side hook for getting initialized services
function useFirebaseClient() {
    // This ensures Firebase is initialized only on the client-side
    if (typeof window !== 'undefined') {
        const { app, auth, db } = initializeFirebase();
        if (app && auth && db) {
            return { app, auth, db };
        }
    }
    return { app: null, auth: null, db: null };
}


// Server-side safe getters
function getAuthInstance() {
    if (!auth) {
        initializeFirebase();
    }
    return auth!;
}

function getFirestoreInstance() {
    if (!db) {
        initializeFirebase();
    }
    return db!;
}


export { initializeFirebase, useFirebaseClient, getFirestoreInstance, getAuthInstance };
