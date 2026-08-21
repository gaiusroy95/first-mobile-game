import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/** Boosts the lowest-HP% ally's `ability.stat` by a fractional amount for `ability.duration`. */
export class BuffSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.allies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return this.lowestHpEntity(context.allies);
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    const stat = context.ability.stat ?? "defense";
    context.effects.applyBuff(target, stat, context.ability.power ?? 0.2);
  }
}
