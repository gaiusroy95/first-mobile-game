import type { SkillKind } from "@battle-formation/shared-types";
import type { Skill, SkillCastContext, SkillCastResult } from "./Skill";
import { DamageSkill } from "./DamageSkill";
import { HealSkill } from "./HealSkill";
import { ShieldSkill } from "./ShieldSkill";
import { BuffSkill } from "./BuffSkill";
import { FreezeSkill } from "./FreezeSkill";
import { SlowSkill } from "./SlowSkill";

/**
 * Dispatches a cast to the executor registered for its `ability.kind`.
 * This is the whole extension mechanism: a new ability of an existing kind
 * (a second Fireball, a Frost Nova with different numbers) needs nothing
 * here at all - it's just another entry in a hero's `abilities` data. Only
 * a genuinely new kind of effect needs a `register()` call.
 */
export class SkillManager {
  private readonly skills = new Map<SkillKind, Skill>([
    ["damage", new DamageSkill()],
    ["heal", new HealSkill()],
    ["shield", new ShieldSkill()],
    ["buff", new BuffSkill()],
    ["freeze", new FreezeSkill()],
    ["slow", new SlowSkill()],
  ]);

  /** Registers (or replaces) the executor for a skill kind. */
  register(kind: SkillKind, skill: Skill): void {
    this.skills.set(kind, skill);
  }

  cast(context: SkillCastContext): SkillCastResult {
    const skill = this.skills.get(context.ability.kind);
    if (!skill) {
      throw new Error(`No skill executor registered for kind "${context.ability.kind}"`);
    }
    return skill.cast(context);
  }
}
