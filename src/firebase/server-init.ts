
'use server';
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization on every call.
// This is a standard pattern for serverless environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase server initialization error', error.stack);
  }
}

const firestore = admin.firestore();

// Export the initialized services
export { firestore };

// This function is kept for structural consistency, but the instances are now module-level.
export async function initializeServerFirebase() {
  return { firestore };
}
