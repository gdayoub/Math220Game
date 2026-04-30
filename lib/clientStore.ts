"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterId } from "./characters";

export type Theme = "candy" | "red";

type State = {
  selectedCharacter: CharacterId | null;
  bootedThisSession: boolean;
  theme: Theme;
  setCharacter: (id: CharacterId) => void;
  markBooted: () => void;
  setTheme: (t: Theme) => void;
};

export const useClient = create<State>()(
  persist(
    (set) => ({
      selectedCharacter: null,
      bootedThisSession: false,
      theme: "candy",
      setCharacter: (id) => set({ selectedCharacter: id }),
      markBooted: () => set({ bootedThisSession: true }),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "math220-arena-client",
      partialize: (s) => ({
        selectedCharacter: s.selectedCharacter,
        theme: s.theme,
      }),
    },
  ),
);
