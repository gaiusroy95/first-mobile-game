import type { Ability, SkillStat } from "@battle-formation/shared-types";
import type { HeroEntity } from "../HeroEntity";

/**
 * The mutations a skill is allowed to cause, provided by BattleManager -
 * skills never touch BattleEvent shapes, cooldowns, or outcome-checking
 * themselves. This keeps authoritative battle state changes (and the
 * event log) in exactly one place, while skills stay pure decision-makers:
 * who to affect and what to request, never how bookkeeping works.
 */
export interface SkillEffects {
  dealDamage(target: HeroEntity, amount: number): void;
  heal(target: HeroEntity, amount: number): void;
  applyShield(target: HeroEntity, amount: number): void;
  applyBuff(target: HeroEntity, stat: SkillStat, power: number): void;
  applyFreeze(target: HeroEntity): void;
  applySlow(target: HeroEntity, power: number): void;
}

export interface SkillCastContext {
  caster: HeroEntity;
  ability: Ability;
  /** Every living hero on the caster's side, including the caster itself. */
  allies: HeroEntity[];
  /** Every living hero on the opposing side. */
  enemies: HeroEntity[];
  effects: SkillEffects;
}

export interface SkillCastResult {
  /** Every hero this cast affected, for the "ability" BattleEvent's targetIds. */
  targetIds: string[];
}

/**
 * One executor per SkillKind (see SkillManager), never one per ability id
 * or hero. A skill only needs to know how to pick a target and what
 * effect to request - `Ability.kind` is the only thing that determines
 * which Skill instance runs, so a new ability of an existing kind is pure
 * data and needs no new code.
 */
export interface Skill {
  cast(context: SkillCastContext): SkillCastResult;
}
