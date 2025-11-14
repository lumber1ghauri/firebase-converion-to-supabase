'use client';
    
import { useState, useEffect, useMemo } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  doc
} from 'firebase/firestore';
import { useFirebase } from '@/firebase/hooks';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useDoc<T = any>(
  path: string,
  id: string | undefined | null
): UseDocResult<T> {
  const { firestore } = useFirebase();
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const docRef = useMemo(() => {
      if (!firestore || !path || !id) return null;
      return doc(firestore, path, id);
  }, [firestore, path, id]);


  useEffect(() => {
    if (!docRef) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error(`Error fetching document ${path}/${id}:`, err);
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        });
        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [docRef, path, id]);

  return { data, isLoading, error };
}
