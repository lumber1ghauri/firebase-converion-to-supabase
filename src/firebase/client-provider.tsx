'use client';

import { useState, useEffect, ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseContext, FirebaseContextValue } from './provider';
import { Loader2 } from 'lucide-react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const { app, auth, db } = initializeFirebase();
    setFirebase({ app, auth, db });
  }, []);

  if (!firebase) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Initializing...</p>
        </div>
    );
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}
