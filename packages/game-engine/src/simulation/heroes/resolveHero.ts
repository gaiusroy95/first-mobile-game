import type { Hero, HeroDefinition } from "@battle-formation/shared-types";

/** +8% hp/attack/defense per level, uniformly - not tuned per class or rarity. */
const GROWTH_PER_LEVEL = 0.08;

/**
 * Resolves a hero template + level into level-scaled combat stats. Pure -
 * no database lookup, so anyone already holding a `HeroDefinition` (the
 * battlefield bridge, a future backend re-validating a client's roster)
 * can call it directly instead of needing a whole HeroManager/HeroLoader
 * just to level-scale one hero. HeroManager.createHero is a thin wrapper
 * around this for callers that only have an id.
 */
export function resolveHero(definition: HeroDefinition, level: number): Hero {
  const multiplier = 1 + GROWTH_PER_LEVEL * (level - 1);

  return {
    id: definition.id,
    name: definition.name,
    class: definition.class,
    faction: definition.faction,
    role: definition.role,
    rarity: definition.rarity,
    level,
    hp: Math.round(definition.baseStats.hp * multiplier),
    attack: Math.round(definition.baseStats.attack * multiplier),
    defense: Math.round(definition.baseStats.defense * multiplier),
    attackSpeed: definition.baseStats.attackSpeed,
    range: definition.baseStats.range,
    movementSpeed: definition.baseStats.movementSpeed,
    abilities: definition.abilities,
  };
}
