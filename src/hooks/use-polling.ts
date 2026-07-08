import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * Poll a backend command at the user-configured refresh interval.
 * Keeps the previous value while a new one is in flight.
 */
export function usePolling<T>(command: string): T | null {
  const intervalMs = useSettingsStore((s) => s.refreshIntervalMs);
  const [data, setData] = useState<T | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      try {
        const result = await invoke<T>(command);
        if (!cancelled) {
          setData(result);
        }
      } catch {
        // Collector failures already degrade to Field::Unavailable; a hard
        // invoke error (e.g. plain browser) just leaves data as-is.
      } finally {
        inFlight.current = false;
      }
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [command, intervalMs]);

  return data;
}
