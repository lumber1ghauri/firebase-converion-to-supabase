
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a temporary solution to use the client-side config for server-side actions.
// In a real production app, you would use service account credentials.
const serviceAccount = {
    projectId: firebaseConfig.projectId,
    clientEmail: `firebase-adminsdk-xxxxx@${firebaseConfig.projectId}.iam.gserviceaccount.com`, // Placeholder
    privateKey: '-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n', // Placeholder
};

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps.find(app => app.name === 'admin') || initializeApp({ projectId: firebaseConfig.projectId }, 'admin');
    }
    // In a real app, you would use applicationDefault() or a service account file.
    // For this environment, we're simulating initialization.
    return initializeApp({
        projectId: firebaseConfig.projectId,
    }, 'admin');
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
