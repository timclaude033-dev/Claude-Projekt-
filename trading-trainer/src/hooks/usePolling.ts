import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../lib/api';

/** Pollt einen GET-Endpunkt in festem Intervall; refresh() erzwingt ein Update. */
export function usePolling<T>(path: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await apiGet<T>(path);
      if (alive.current) {
        setData(d);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : 'Fehler');
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    void load();
    const id = setInterval(load, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { data, error, refresh: load };
}
