import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/** Reduces the caster's current target's effective movementSpeed by a fraction for `ability.duration`. */
export class SlowSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.enemies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return context.caster.target;
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    context.effects.applySlow(target, context.ability.power ?? 0.3);
  }
}
