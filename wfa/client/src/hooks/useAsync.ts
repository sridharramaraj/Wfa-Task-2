import { useEffect, useState } from 'react';

interface State<T> { data: T | null; error: string | null; loading: boolean }

/** Runs an async loader whenever deps change; cancels stale requests and keeps previous data visible while reloading. */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    load(ctl.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((e: Error) => { if (e.name !== 'AbortError') setState((s) => ({ ...s, error: e.message, loading: false })); });
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}
