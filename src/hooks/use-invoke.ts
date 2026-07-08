import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface InvokeState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch a backend command once on mount. Collectors never panic — an error
 * here means the invoke layer itself failed (e.g. running in a plain browser).
 */
export function useInvoke<T>(command: string): InvokeState<T> {
  const [state, setState] = useState<InvokeState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    invoke<T>(command)
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [command]);

  return state;
}
