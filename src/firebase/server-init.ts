'use server';
import { initializeApp, getApps, getApp, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App;

export async function initializeServerFirebase() {
  if (!getApps().length) {
    // When no configuration is provided, the Admin SDK automatically looks for 
    // Application Default Credentials, which is the correct way to authenticate in
    // a managed Google Cloud environment like App Hosting.
    // However, to ensure connection to the right project, we will initialize with config.
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
