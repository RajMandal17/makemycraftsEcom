import React, { createContext, useContext, useState, useCallback } from 'react';
import DeerLoadingAnimation from '../components/common/DeerLoadingAnimation';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading beautiful artworks...');
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = useCallback((message?: string) => {
    setLoadingCount(prev => prev + 1);
    if (message) {
      setLoadingMessage(message);
    }
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingMessage('Loading beautiful artworks...');
        }, 300);
      }
      return newCount;
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading }}>
      {children}
      {isLoading && <DeerLoadingAnimation message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
