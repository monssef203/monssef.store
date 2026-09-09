/**
 * MONSTORE — Admin hooks: small data-fetching utilities used by admin pages.
 */

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

/** Debounce a fast-changing value (e.g. a search input). */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Run an async loader whenever `deps` change.
 * Keeps the previous data while reloading (stale-while-revalidate), which
 * gives smooth pagination / filter transitions without blank screens.
 */
export function useFetch<T>(loader: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loaderRef.current().then(
      (data) => {
        if (active) setState({ data, loading: false, error: null });
      },
      (error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  /** Refetch the current query. */
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  /** Imperatively patch the current data (used after mutations). */
  const setData = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setState((prev) => ({
      loading: false,
      error: null,
      data: typeof updater === "function" ? (updater as (prev: T | null) => T | null)(prev.data) : updater,
    }));
  }, []);

  return { ...state, reload, setData };
}

/** Bind a keydown Escape handler while `active` is true. */
export function useEscape(active: boolean, onEscape: () => void): void {
  const handlerRef = useRef(onEscape);
  handlerRef.current = onEscape;
  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlerRef.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);
}
