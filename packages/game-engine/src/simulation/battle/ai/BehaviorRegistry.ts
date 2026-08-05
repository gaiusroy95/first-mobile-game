import type { Hero, HeroClass } from "@battle-formation/shared-types";
import type { HeroBehavior } from "./HeroBehavior";
import { aggressiveMeleeBehavior } from "./behaviors/aggressiveMelee";
import { rangedBehavior } from "./behaviors/ranged";
import { backlineHunterBehavior } from "./behaviors/backlineHunter";
import { defaultBehavior } from "./behaviors/defaultBehavior";

const DEFAULT_CLASS_BEHAVIORS: Partial<Record<HeroClass, HeroBehavior>> = {
  tank: aggressiveMeleeBehavior,
  knight: aggressiveMeleeBehavior,
  archer: rangedBehavior,
  "fire-mage": rangedBehavior,
  "ice-mage": rangedBehavior,
  healer: rangedBehavior,
  assassin: backlineHunterBehavior,
};

/**
 * Resolves which HeroBehavior governs a given hero's targeting/positioning
 * decisions: a per-hero-id override wins over its class's default, which
 * wins over a universal fallback. That priority order is the whole point -
 * a brand new hero works immediately via its class (or the fallback, for a
 * brand new class), and can later be given bespoke behavior distinct from
 * every other hero of its class without touching BattleManager, the AI
 * state machine, or any other hero's registration.
 */
export class BehaviorRegistry {
  private readonly heroOverrides = new Map<string, HeroBehavior>();
  private readonly classBehaviors: Map<HeroClass, HeroBehavior>;

  constructor() {
    this.classBehaviors = new Map(Object.entries(DEFAULT_CLASS_BEHAVIORS) as [HeroClass, HeroBehavior][]);
  }

  /** Registers bespoke behavior for one specific hero id, overriding its class default. */
  registerForHero(heroId: string, behavior: HeroBehavior): void {
    this.heroOverrides.set(heroId, behavior);
  }

  /** Registers (or replaces) the default behavior for an entire class. */
  registerForClass(heroClass: HeroClass, behavior: HeroBehavior): void {
    this.classBehaviors.set(heroClass, behavior);
  }

  resolve(hero: Hero): HeroBehavior {
    return this.heroOverrides.get(hero.id) ?? this.classBehaviors.get(hero.class) ?? defaultBehavior;
  }
}
