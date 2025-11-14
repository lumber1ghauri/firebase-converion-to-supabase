'use client';

import { createContext, ReactNode, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
      throw new Error('FirebaseProvider must be used within a FirebaseClientProvider');
  }
  return <>{children}</>;
}
