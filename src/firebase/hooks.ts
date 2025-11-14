'use client';

import { useContext } from 'react';
import { FirebaseContext } from './provider';

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export function useFirebaseApp() {
  const { app } = useFirebase();
  if (!app) {
    throw new Error(
      'Firebase app is not initialized. Make sure you have a FirebaseProvider component in your app.'
    );
  }
  return app;
}

export function useFirestore() {
  const { db } = useFirebase();
  if (!db) {
    throw new Error(
      'Firestore is not initialized. Make sure you have a FirebaseProvider component in your app.'
    );
  }
  return db;
}

export function useAuth() {
  const { auth } = useFirebase();
  if (!auth) {
    throw new Error(
      'Firebase Auth is not initialized. Make sure you have a FirebaseProvider component in your app.'
    );
  }
  return auth;
}
