import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
export function useErrorHandler(options = {}) {
  const {
    showToast = true,
    logError = true,
    rethrow = false
  } = options;
  const {
    toast
  } = useToast();
  const [error, setError] = useState(null);
  const handleError = useCallback((err, customMessage) => {
    const error = err instanceof Error ? err : new Error(String(err));
    if (logError) {
      console.error('Error:', error);
    }
    setError(error);
    if (showToast) {
      toast({
        title: 'Error',
        description: customMessage || error.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
    if (rethrow) {
      throw error;
    }
  }, [showToast, logError, rethrow, toast]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  return {
    error,
    handleError,
    clearError
  };
}