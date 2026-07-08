import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Themes } from "@/config/themes";

export type Language = "tr" | "en";

interface SettingsState {
  colorTheme: Themes;
  language: Language;
  /** Refresh interval for live metrics, in milliseconds. */
  refreshIntervalMs: number;
  /** Whether the welcome screen was already dismissed this session. */
  setColorTheme: (theme: Themes) => void;
  setLanguage: (language: Language) => void;
  setRefreshIntervalMs: (ms: number) => void;
}

export const applyColorTheme = (theme: Themes) => {
  const root = document.documentElement;
  if (theme === "default" || !theme) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
};

function detectDefaultLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorTheme: "default",
      language: detectDefaultLanguage(),
      refreshIntervalMs: 1000,

      setColorTheme: (theme) => {
        set({ colorTheme: theme });
        applyColorTheme(theme);
      },
      setLanguage: (language) => set({ language }),
      setRefreshIntervalMs: (refreshIntervalMs) => set({ refreshIntervalMs }),
    }),
    {
      name: "cpum-settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyColorTheme(state.colorTheme);
        }
      },
    },
  ),
);
