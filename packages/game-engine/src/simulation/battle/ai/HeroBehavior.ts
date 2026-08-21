import type { HeroEntity } from "../HeroEntity";

export interface BehaviorContext {
  self: HeroEntity;
  enemies: HeroEntity[];
  allies: HeroEntity[];
}

/**
 * A hero class's (or one specific hero's) combat AI: who it fights and how
 * it positions itself. This is deliberately narrow - just targeting and
 * positioning - so it never needs to know about damage formulas, cooldowns,
 * or the event log. Ability-cast targeting (heal the lowest-HP ally, damage
 * the current target, ...) is handled separately by SkillManager dispatching
 * on `ability.kind`, which is already class-agnostic; HeroBehavior only
 * decides auto-attack targeting and movement, so implementing one never
 * requires touching skill logic or any other hero's behavior.
 */
export interface HeroBehavior {
  /** Which enemy to engage this tick. Null if no valid target exists. */
  selectTarget(context: BehaviorContext): HeroEntity | null;
  /** Whether to close distance toward the current target this tick, or hold position. */
  shouldAdvance(context: BehaviorContext): boolean;
}
