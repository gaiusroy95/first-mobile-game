import { create } from "zustand";
import type { BattleRewards, PlayerSide } from "@battle-formation/shared-types";

interface BattleResultState {
  winner: PlayerSide;
  rewards: BattleRewards;
}

interface BattleState {
  lastResult: BattleResultState | null;
  setResult: (winner: PlayerSide, rewards: BattleRewards) => void;
  reset: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
  lastResult: null,
  setResult: (winner, rewards) => set({ lastResult: { winner, rewards } }),
  reset: () => set({ lastResult: null }),
}));
