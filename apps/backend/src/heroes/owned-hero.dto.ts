import type { OwnedHero } from "@battle-formation/shared-types";
import type { OwnedHeroEntity } from "./owned-hero.entity";

/** Maps the DB row (`id`) onto the shared wire shape (`instanceId`). */
export function toOwnedHeroDto(entity: OwnedHeroEntity): OwnedHero {
  return {
    instanceId: entity.id,
    heroId: entity.heroId,
    level: entity.level,
    upgrades: entity.upgrades ?? [],
    cosmeticId: entity.cosmeticId ?? undefined,
  };
}
