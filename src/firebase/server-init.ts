
'use server';

import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It ensures that initialization happens only once.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  try {
    // When running in a Google Cloud environment, the SDK can automatically
    // detect the project credentials.
    return admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase server initialization error', error.stack);
    // Re-throw the error to make it visible to the caller.
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

// Call the initialization function to get the app instance.
const adminApp = initializeAdminApp();
// Get the Firestore instance from the initialized app.
const firestore = admin.firestore();

/**
 * A server-only function that returns the initialized Firestore instance.
 * Other server-side modules can call this to get a ready-to-use Firestore object.
 */
export async function initializeServerFirebase() {
  // The function now simply returns the already-initialized instance.
  return { firestore };
}
