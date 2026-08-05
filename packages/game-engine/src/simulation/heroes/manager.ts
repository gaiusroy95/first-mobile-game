import type { Hero, HeroClass, HeroDefinition } from "@battle-formation/shared-types";
import { HeroLoader, createHeroLoader } from "./loader";
import { resolveHero } from "./resolveHero";

/**
 * Runtime API for querying heroes and resolving a template + level into a
 * battle-ready `Hero`. Every method is generic over `HeroDefinition`/
 * `HeroClass` - there is no per-class or per-id branch anywhere in this
 * file. That's what "adding a hero doesn't require changing game logic"
 * actually means in code: this manager, and everything downstream of it
 * (the simulation, GameManager, the UI), only ever see data, never a
 * hardcoded roster.
 */
export class HeroManager {
  constructor(private readonly loader: HeroLoader = createHeroLoader()) {}

  /** Merges in additional hero definitions (a DLC pack, live-ops content) at runtime. */
  registerHeroes(definitions: HeroDefinition[]): void {
    this.loader.load(definitions);
  }

  getDefinition(id: string): HeroDefinition {
    const definition = this.loader.get(id);
    if (!definition) {
      throw new Error(`Unknown hero id: "${id}"`);
    }
    return definition;
  }

  listDefinitions(): HeroDefinition[] {
    return this.loader.getAll();
  }

  listByClass(heroClass: HeroClass): HeroDefinition[] {
    return this.loader.getAll().filter((definition) => definition.class === heroClass);
  }

  /** Resolves a hero template + level into level-scaled combat stats. */
  createHero(id: string, level: number): Hero {
    return resolveHero(this.getDefinition(id), level);
  }
}
