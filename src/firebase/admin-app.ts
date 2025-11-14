
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
    try {
        // This will work in production on App Hosting
        adminApp = initializeApp();
    } catch (e) {
        // In local development, use a service account
        if (process.env.SERVICE_ACCOUNT) {
             adminApp = initializeApp({
                credential: cert(JSON.parse(process.env.SERVICE_ACCOUNT))
            });
        } else {
            console.warn("SERVICE_ACCOUNT env var not set. Firebase Admin SDK might not be initialized locally.");
            // Fallback for environments where default credentials might be available but SERVICE_ACCOUNT is not set.
            adminApp = initializeApp();
        }
    }
} else {
    adminApp = getApps()[0];
}

const adminDb: Firestore = getFirestore(adminApp);

export { adminDb, adminApp };
