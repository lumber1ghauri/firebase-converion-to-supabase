'use server';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App;

export async function initializeServerFirebase() {
  if (!getApps().length) {
    app = initializeApp({
      // Use the client-side config for project details
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  } else {
    app = getApp();
  }

  return {
    firestore: getFirestore(app),
  };
}
