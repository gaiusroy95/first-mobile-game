import type { SkillStat } from "@battle-formation/shared-types";

/**
 * A live buff/freeze/slow on a HeroEntity. Shield is deliberately not
 * represented here - it's a damage-absorption buffer, not a stat modifier
 * or an action-gate, so it gets its own dedicated fields on HeroEntity
 * (shieldHp/shieldTicksRemaining) instead of fitting this shape.
 */
export interface ActiveEffect {
  kind: "buff" | "freeze" | "slow";
  /** buff only: which stat it modifies. */
  stat?: SkillStat;
  /** Fractional stat change for buff/slow (0.3 = +/-30%). Unused by freeze. */
  power: number;
  remainingTicks: number;
}
