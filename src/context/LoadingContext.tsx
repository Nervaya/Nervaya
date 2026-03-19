'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { GlobalLoader } from '@/components/common/GlobalLoader';

interface LoadingContextType {
  showLoader: (label?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string | undefined>(undefined);

  const showLoader = useCallback((label?: string) => {
    setLoadingLabel(label);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setLoadingLabel(undefined);
  }, []);

  const value = useMemo(
    () => ({
      showLoader,
      hideLoader,
      isLoading,
    }),
    [showLoader, hideLoader, isLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <GlobalLoader label={loadingLabel} centerPage />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
