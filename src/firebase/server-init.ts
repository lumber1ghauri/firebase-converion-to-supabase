
'use server';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

export async function initializeServerFirebase() {
  // Check if the app is already initialized to prevent re-initialization on every call.
  // This is a standard pattern for serverless environments.
  if (!getApps().length) {
    app = initializeApp();
  } else {
    app = getApp();
  }

  return {
    firestore: getFirestore(app),
  };
}
