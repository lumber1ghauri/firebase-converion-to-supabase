
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This simplified approach ensures that we initialize the app only once
// and rely on the managed environment's Application Default Credentials.

let adminApp: App;
let adminDb: Firestore;

if (!getApps().length) {
  // In a managed environment like Firebase App Hosting or Cloud Functions,
  // calling initializeApp() without arguments automatically uses the
  // project's service account credentials (Application Default Credentials).
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp);

export { adminDb };
