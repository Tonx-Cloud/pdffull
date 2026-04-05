import { create } from "zustand";
import type { Profile, ConversionLimit } from "@/types";

interface AppState {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;

  conversionLimit: ConversionLimit | null;
  setConversionLimit: (l: ConversionLimit | null) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),

  conversionLimit: null,
  setConversionLimit: (conversionLimit) => set({ conversionLimit }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
