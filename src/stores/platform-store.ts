import { create } from "zustand";
import type { PlatformInfo } from "@/types/platform";

interface PlatformState {
  platform: PlatformInfo | null;
  setPlatform: (platform: PlatformInfo) => void;
}

/** Detected once at startup; read by every page that needs OS context. */
export const usePlatformStore = create<PlatformState>((set) => ({
  platform: null,
  setPlatform: (platform) => set({ platform }),
}));
