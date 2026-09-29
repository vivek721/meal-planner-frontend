import { useCallback, useEffect, useState } from 'react';
import { RecipeApiError, toRecipeApiError } from '../services/api/recipesApi';

export interface AsyncState<T> {
  data: T | null;
  error: RecipeApiError | null;
  loading: boolean;
  /** Runs the loader again (the Retry button). */
  retry: () => void;
}

export interface AsyncOptions {
  /**
   * While a new loader runs, keep returning the last successful data (with
   * loading still true) instead of null, so the page need not blank out.
   */
  keepPreviousData?: boolean;
}

interface Settled<T> {
  loader: () => Promise<T>;
  attempt: number;
  data: T | null;
  error: RecipeApiError | null;
}

/**
 * Runs `loader` whenever it changes: pass a memoised function, or null when
 * there is nothing to load. Only the result for the current loader and attempt
 * is ever shown, so a slow response for an older query (or one that arrives
 * after unmount) is ignored.
 */
export function useAsync<T>(loader: (() => Promise<T>) | null, options: AsyncOptions = {}): AsyncState<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    if (!loader) return;
    let current = true;
    loader().then(
      (data) => {
        if (current) setSettled({ loader, attempt, data, error: null });
      },
      (error: unknown) => {
        if (current) setSettled({ loader, attempt, data: null, error: toRecipeApiError(error) });
      },
    );
    return () => {
      current = false;
    };
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const isCurrent = loader !== null && settled !== null && settled.loader === loader && settled.attempt === attempt;
  const loading = loader !== null && !isCurrent;
  const previous = options.keepPreviousData && loading ? (settled?.data ?? null) : null;
  return {
    data: isCurrent ? settled.data : previous,
    error: isCurrent ? settled.error : null,
    loading,
    retry,
  };
}
