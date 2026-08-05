import { create } from "zustand";

interface PlayerState {
  gold: number;
  addGold: (amount: number) => void;
  /** Returns false (and changes nothing) if the player can't afford it. */
  spendGold: (amount: number) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  gold: 300,
  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount) => {
    if (get().gold < amount) return false;
    set((state) => ({ gold: state.gold - amount }));
    return true;
  },
}));
