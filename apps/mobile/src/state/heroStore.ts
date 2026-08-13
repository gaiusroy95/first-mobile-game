import { create } from "zustand";
import type { OwnedHero } from "@battle-formation/shared-types";
import {
  equipCosmetic as equipCosmeticApi,
  fetchOwnedHeroes as fetchOwnedHeroesApi,
  unlockHero as unlockHeroApi,
  upgradeHero as upgradeHeroApi,
} from "../api/endpoints/heroes";

interface HeroState {
  ownedHeroes: OwnedHero[];
  status: "idle" | "loading" | "error";
  error: string | null;
  fetchOwnedHeroes: () => Promise<void>;
  upgradeHero: (instanceId: string) => Promise<void>;
  unlockHero: (heroId: string) => Promise<void>;
  equipCosmetic: (instanceId: string, cosmeticId: string | null) => Promise<void>;
  reset: () => void;
}

export const useHeroStore = create<HeroState>((set, get) => ({
  ownedHeroes: [],
  status: "idle",
  error: null,

  fetchOwnedHeroes: async () => {
    set({ status: "loading", error: null });
    try {
      const heroes = await fetchOwnedHeroesApi();
      set({ ownedHeroes: heroes, status: "idle" });
    } catch (error) {
      set({
        ownedHeroes: [],
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load heroes",
      });
    }
  },

  upgradeHero: async (instanceId) => {
    const updated = await upgradeHeroApi(instanceId);
    set((state) => ({
      ownedHeroes: state.ownedHeroes.map((hero) => (hero.instanceId === instanceId ? updated : hero)),
    }));
  },

  unlockHero: async (heroId) => {
    const created = await unlockHeroApi(heroId);
    set((state) => ({ ownedHeroes: [...state.ownedHeroes, created] }));
  },

  equipCosmetic: async (instanceId, cosmeticId) => {
    const updated = await equipCosmeticApi(instanceId, cosmeticId);
    set((state) => ({
      ownedHeroes: state.ownedHeroes.map((hero) => (hero.instanceId === instanceId ? updated : hero)),
    }));
  },

  reset: () => set({ ownedHeroes: [], status: "idle", error: null }),
}));
