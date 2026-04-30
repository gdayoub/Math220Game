"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterId } from "./characters";

type State = {
  selectedCharacter: CharacterId | null;
  bootedThisSession: boolean;
  setCharacter: (id: CharacterId) => void;
  markBooted: () => void;
};

export const useClient = create<State>()(
  persist(
    (set) => ({
      selectedCharacter: null,
      bootedThisSession: false,
      setCharacter: (id) => set({ selectedCharacter: id }),
      markBooted: () => set({ bootedThisSession: true }),
    }),
    {
      name: "math220-arena-client",
      partialize: (s) => ({ selectedCharacter: s.selectedCharacter }),
    },
  ),
);
