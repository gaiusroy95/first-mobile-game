import { create } from "zustand";
import { heroDatabase } from "@battle-formation/game-engine";
import type { OwnedHero } from "@battle-formation/shared-types";
import { fetchOwnedHeroes as fetchOwnedHeroesApi, upgradeHero as upgradeHeroApi } from "../api/endpoints/heroes";

interface HeroState {
  ownedHeroes: OwnedHero[];
  status: "idle" | "loading" | "error";
  fetchOwnedHeroes: () => Promise<void>;
  upgradeHero: (instanceId: string) => Promise<void>;
}

function buildStarterRoster(): OwnedHero[] {
  return heroDatabase.map((definition) => ({
    instanceId: `mine-${definition.id}`,
    heroId: definition.id,
    level: 1,
    upgrades: [],
  }));
}

export const useHeroStore = create<HeroState>((set, get) => ({
  ownedHeroes: [],
  status: "idle",

  fetchOwnedHeroes: async () => {
    set({ status: "loading" });
    try {
      const heroes = await fetchOwnedHeroesApi();
      set({ ownedHeroes: heroes, status: "idle" });
    } catch {
      // No backend yet - fall back to a local starter roster (one of each
      // hero, level 1) so the app stays fully navigable. Swap this out
      // once GET /heroes is live; every screen already reads from
      // ownedHeroes, nothing else needs to change.
      set({ ownedHeroes: buildStarterRoster(), status: "idle" });
    }
  },

  upgradeHero: async (instanceId) => {
    const current = get().ownedHeroes.find((hero) => hero.instanceId === instanceId);
    if (!current) return;

    try {
      const updated = await upgradeHeroApi(instanceId);
      set((state) => ({
        ownedHeroes: state.ownedHeroes.map((hero) => (hero.instanceId === instanceId ? updated : hero)),
      }));
    } catch {
      // No backend yet - apply the level-up locally.
      set((state) => ({
        ownedHeroes: state.ownedHeroes.map((hero) =>
          hero.instanceId === instanceId ? { ...hero, level: hero.level + 1 } : hero
        ),
      }));
    }
  },
}));
