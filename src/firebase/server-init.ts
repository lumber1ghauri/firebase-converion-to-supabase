import admin from 'firebase-admin';

// This function ensures that the Firebase Admin SDK is initialized only once.
if (!admin.apps.length) {
  try {
    // Check if we have a service account key in environment variables (for local development)
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      // Local development: use service account credentials
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin initialized with service account credentials');
    } else {
      // Production (Google Cloud): automatically detect credentials
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (error: any) {
    console.error('Firebase server initialization error', error.stack);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

// Get the Firestore instance from the initialized app.
const firestore = admin.firestore();

/**
 * A server-only function that returns the initialized Firestore instance.
 * Other server-side modules can call this to get a ready-to-use Firestore object.
 */
export function getServerFirestore() {
  // The function now simply returns the already-initialized instance.
  return { firestore };
}
