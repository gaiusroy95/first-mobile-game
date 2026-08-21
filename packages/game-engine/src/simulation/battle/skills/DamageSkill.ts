import { calculateDamage } from "../DamageCalculator";
import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/**
 * Single target when `ability.radius` is unset, area damage when it's set -
 * "single target" vs "area damage" is a data toggle (BaseSkill.expandArea),
 * not two separate kinds or two separate classes.
 */
export class DamageSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.enemies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return context.caster.target;
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    const damage = calculateDamage(
      context.caster.getEffectiveStat("attack"),
      target.getEffectiveStat("defense"),
      context.ability.power ?? 1
    );
    context.effects.dealDamage(target, damage);
  }
}
