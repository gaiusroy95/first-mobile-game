import { create } from "zustand";
import { buyCosmetic, fetchMe } from "../api/endpoints/player";

interface PlayerState {
  gold: number;
  gems: number;
  trophies: number;
  level: number;
  xp: number;
  materials: Record<string, number>;
  heroCards: Record<string, number>;
  ownedCosmetics: string[];
  status: "idle" | "loading" | "error";
  refreshProfile: () => Promise<void>;
  applyReward: (reward: {
    gold?: number;
    experience?: number;
    trophyDelta?: number;
    materials?: { materialId: string; count: number }[];
    heroCards?: { heroId: string; count: number }[];
  }) => void;
  purchaseCosmetic: (cosmeticId: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  gold: 0,
  gems: 0,
  trophies: 0,
  level: 1,
  xp: 0,
  materials: {},
  heroCards: {},
  ownedCosmetics: [],
  status: "idle",

  refreshProfile: async () => {
    set({ status: "loading" });
    try {
      const me = await fetchMe();
      set({
        gold: me.gold,
        gems: me.gems,
        trophies: me.trophies,
        level: me.level,
        xp: me.xp,
        materials: me.materials ?? {},
        heroCards: me.heroCards ?? {},
        ownedCosmetics: me.ownedCosmetics ?? [],
        status: "idle",
      });
    } catch {
      set({ status: "error" });
    }
  },

  applyReward: (reward) =>
    set((state) => {
      const materials = { ...state.materials };
      for (const drop of reward.materials ?? []) {
        materials[drop.materialId] = (materials[drop.materialId] ?? 0) + drop.count;
      }
      const heroCards = { ...state.heroCards };
      for (const drop of reward.heroCards ?? []) {
        heroCards[drop.heroId] = (heroCards[drop.heroId] ?? 0) + drop.count;
      }
      return {
        gold: state.gold + (reward.gold ?? 0),
        xp: state.xp + (reward.experience ?? 0),
        trophies: Math.max(0, state.trophies + (reward.trophyDelta ?? 0)),
        materials,
        heroCards,
      };
    }),

  purchaseCosmetic: async (cosmeticId) => {
    const me = await buyCosmetic(cosmeticId);
    set({
      gems: me.gems,
      ownedCosmetics: me.ownedCosmetics ?? [],
    });
  },
}));
