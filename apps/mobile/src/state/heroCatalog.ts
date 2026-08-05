import { HeroManager, resolveHero } from "@battle-formation/game-engine";
import type { Hero, HeroDefinition, OwnedHero } from "@battle-formation/shared-types";

/** Single shared catalog instance - every screen that needs to resolve a heroId to its data goes through this, rather than each constructing its own HeroManager. */
export const heroManager = new HeroManager();

export function getHeroDefinition(heroId: string): HeroDefinition {
  return heroManager.getDefinition(heroId);
}

/** An owned hero's level-scaled combat stats, straight from its template + level. */
export function resolveOwnedHero(owned: OwnedHero): Hero {
  return resolveHero(getHeroDefinition(owned.heroId), owned.level);
}
