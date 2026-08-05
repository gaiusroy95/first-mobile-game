import type { HeroEntity } from "../HeroEntity";
import type { Skill, SkillCastContext, SkillCastResult } from "./Skill";

/**
 * Shared plumbing every skill kind needs: pick a primary target, optionally
 * expand to an area around it, apply the effect to each affected hero once.
 * Concrete skills (DamageSkill, HealSkill, ...) only implement the three
 * kind-specific decisions - which pool they draw from, who the primary
 * target is, and what the effect actually does - never the targeting/area
 * mechanics, so those stay consistent across every kind for free.
 */
export abstract class BaseSkill implements Skill {
  cast(context: SkillCastContext): SkillCastResult {
    const primary = this.selectPrimaryTarget(context);
    if (!primary) {
      return { targetIds: [] };
    }

    const radius = context.ability.radius ?? 0;
    const targets =
      radius > 0 ? this.expandArea(primary, this.candidatePool(context), radius) : [primary];

    for (const target of targets) {
      this.applyEffect(context, target);
    }

    return { targetIds: targets.map((target) => target.instanceId) };
  }

  /** Which pool (allies or enemies) this skill's targets come from. */
  protected abstract candidatePool(context: SkillCastContext): HeroEntity[];
  /** The target before any radius expansion - e.g. the caster's current combat target, or the lowest-HP ally. */
  protected abstract selectPrimaryTarget(context: SkillCastContext): HeroEntity | null;
  /** The kind-specific effect, applied once per affected hero. */
  protected abstract applyEffect(context: SkillCastContext, target: HeroEntity): void;

  /** Every living pool member within `radius` columns of the primary target - a simple, intuitive "blast width" on the 3-column battlefield. */
  private expandArea(primary: HeroEntity, pool: HeroEntity[], radius: number): HeroEntity[] {
    const affected = pool.filter(
      (candidate) => candidate.alive && Math.abs(candidate.col - primary.col) <= radius
    );
    return affected.length > 0 ? affected : [primary];
  }

  /** Shared by heal/shield/buff: whoever in `pool` needs it most, by HP percentage. */
  protected lowestHpEntity(pool: HeroEntity[]): HeroEntity | null {
    return pool.reduce<HeroEntity | null>((worst, candidate) => {
      if (!candidate.alive) return worst;
      if (!worst) return candidate;
      return candidate.currentHp / candidate.hero.hp < worst.currentHp / worst.hero.hp ? candidate : worst;
    }, null);
  }
}
