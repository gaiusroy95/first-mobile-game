import type { HeroEntity } from "../HeroEntity";
import { BaseSkill } from "./BaseSkill";
import type { SkillCastContext } from "./Skill";

/** Prevents the caster's current target from acting at all for `ability.duration` (see HeroEntity.isFrozen / BattleManager.act). */
export class FreezeSkill extends BaseSkill {
  protected candidatePool(context: SkillCastContext): HeroEntity[] {
    return context.enemies;
  }

  protected selectPrimaryTarget(context: SkillCastContext): HeroEntity | null {
    return context.caster.target;
  }

  protected applyEffect(context: SkillCastContext, target: HeroEntity): void {
    context.effects.applyFreeze(target);
  }
}
