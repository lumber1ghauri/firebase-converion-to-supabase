
'use server';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App;

export async function initializeServerFirebase() {
  if (!getApps().length) {
    // When no configuration is provided, the Admin SDK automatically looks for 
    // Application Default Credentials. In the dev environment, we need to be explicit.
    app = initializeApp({
        projectId: firebaseConfig.projectId
    });
  } else {
    app = getApp();
  }

  return {
    firestore: getFirestore(app),
  };
}
