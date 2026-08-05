import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/** Grants the lowest-HP% ally a flat absorb shield (a multiple of the caster's attack stat) that expires after `ability.duration`. */
export class ShieldSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.allies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return this.lowestHpEntity(context.allies);
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    const amount = Math.round(context.caster.getEffectiveStat("attack") * (context.ability.power ?? 1));
    context.effects.applyShield(target, amount);
  }
}
