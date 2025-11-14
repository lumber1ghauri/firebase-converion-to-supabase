
'use server';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

export async function initializeServerFirebase() {
  if (!getApps().length) {
    // When no configuration is provided, the Admin SDK automatically looks for
    // Application Default Credentials, which are available in the Cloud Workstations environment.
    app = initializeApp();
  } else {
    app = getApp();
  }

  return {
    firestore: getFirestore(app),
  };
}
