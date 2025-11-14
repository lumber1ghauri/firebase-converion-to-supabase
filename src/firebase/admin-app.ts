
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

if (getApps().length === 0) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp);

export { adminDb };
