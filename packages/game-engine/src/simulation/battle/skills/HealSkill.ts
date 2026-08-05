import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/** Heals the lowest-HP% ally (including the caster) for a multiple of the caster's attack stat. */
export class HealSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.allies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return this.lowestHpEntity(context.allies);
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    const amount = Math.round(context.caster.getEffectiveStat("attack") * (context.ability.power ?? 1));
    context.effects.heal(target, amount);
  }
}
