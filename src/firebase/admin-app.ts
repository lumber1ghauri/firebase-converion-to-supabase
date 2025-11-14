
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function initializeAdminApp(): App {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }
  
  // In a managed environment (like App Hosting or Cloud Functions),
  // initializeApp() without arguments automatically uses Application Default Credentials.
  try {
    return initializeApp(undefined, 'admin');
  } catch (e) {
    console.error("Failed to initialize Firebase Admin SDK with default credentials.", e);
    // As a fallback for local dev where ADC might not be set, you might use a service account key
    // but in this managed environment, the default should work.
    throw new Error("Firebase Admin initialization failed. Ensure environment is configured correctly.");
  }
}

export function getAdminDb(): Firestore {
    if (!adminApp) {
        adminApp = initializeAdminApp();
    }
    if (!adminDb) {
        adminDb = getFirestore(adminApp);
    }
    return adminDb;
}
