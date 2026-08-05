import type { HeroDefinition } from "@battle-formation/shared-types";
import { heroDatabase } from "./database";

export class HeroValidationError extends Error {}

/**
 * Validates and indexes hero definitions by id. This file never branches on
 * a hero's id or class - only on invariants that apply to every hero
 * equally (unique id, unique ability ids, positive stats) - so it never
 * needs to change when heroes are added, including a future DLC/live-ops
 * pack loaded from a remote source via `load()` instead of a TS literal.
 */
export class HeroLoader {
  private readonly heroes = new Map<string, HeroDefinition>();

  load(definitions: HeroDefinition[]): void {
    for (const definition of definitions) {
      this.validate(definition);
      this.heroes.set(definition.id, definition);
    }
  }

  get(id: string): HeroDefinition | undefined {
    return this.heroes.get(id);
  }

  getAll(): HeroDefinition[] {
    return [...this.heroes.values()];
  }

  private validate(definition: HeroDefinition): void {
    if (this.heroes.has(definition.id)) {
      throw new HeroValidationError(`Duplicate hero id: "${definition.id}"`);
    }

    const { hp, attack, defense, attackSpeed, range, movementSpeed } = definition.baseStats;
    if ([hp, attack, defense, attackSpeed, range, movementSpeed].some((stat) => stat <= 0)) {
      throw new HeroValidationError(`Hero "${definition.id}" has a non-positive base stat`);
    }

    const abilityIds = new Set<string>();
    for (const ability of definition.abilities) {
      if (abilityIds.has(ability.id)) {
        throw new HeroValidationError(
          `Hero "${definition.id}" has duplicate ability id "${ability.id}"`
        );
      }
      abilityIds.add(ability.id);

      const needsDuration = ability.kind === "shield" || ability.kind === "buff" || ability.kind === "freeze" || ability.kind === "slow";
      if (needsDuration && !ability.duration) {
        throw new HeroValidationError(
          `Hero "${definition.id}" ability "${ability.id}" (${ability.kind}) requires a duration`
        );
      }
      if (ability.kind === "buff" && !ability.stat) {
        throw new HeroValidationError(`Hero "${definition.id}" ability "${ability.id}" is a buff but has no stat`);
      }
    }
  }
}

/** A loader preloaded with the built-in roster. Call `.load()` on it to add more. */
export function createHeroLoader(): HeroLoader {
  const loader = new HeroLoader();
  loader.load(heroDatabase);
  return loader;
}
