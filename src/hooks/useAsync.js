import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async loader and exposes { data, error, loading, reload }.
 *
 * Every screen that fetches uses this so loading, error and retry are
 * handled the same way everywhere. In-flight requests are aborted on
 * unmount, and a stale response can never overwrite a newer one.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const runId = ++runIdRef.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loader();
      if (mountedRef.current && runId === runIdRef.current) {
        setState({ data, error: null, loading: false });
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      if (mountedRef.current && runId === runIdRef.current) {
        setState({ data: null, error, loading: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  /** Replace data locally after a mutation, without a refetch. */
  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === "function" ? updater(current.data) : updater,
    }));
  }, []);

  return { ...state, reload: run, setData };
}
