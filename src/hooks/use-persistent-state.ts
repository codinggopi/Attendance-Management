"use client";

import { useState, useEffect, useCallback } from 'react';

function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Prevent SSR window error
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const storageValue = window.localStorage.getItem(key);
      return storageValue ? JSON.parse(storageValue) : initialState;
    } catch (error) {
      console.error(error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      const serializedState = JSON.stringify(state);
      window.localStorage.setItem(key, serializedState);
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
}

export { usePersistentState };
