import type { Hero, PlayerSide, SkillStat } from "@battle-formation/shared-types";
import { CombatComponent } from "./CombatComponent";
import type { AIState } from "./ai/AIState";
import type { ActiveEffect } from "./StatusEffect";

/**
 * A single runtime battle unit: identity, live HP, grid position, the
 * hero's CombatComponent, and any active status effects (shield/buff/
 * freeze/slow). Movement/range use an abstracted lane distance (column
 * offset + front/back depth, plus `penetration` below) rather than full 2D
 * pathfinding - enough for range, attackSpeed, and movementSpeed to all
 * matter without needing pixel-accurate pathing for what is still a
 * shape/text-rendered battlefield.
 */
export class HeroEntity {
  currentHp: number;
  alive = true;
  aiState: AIState = "IDLE";
  target: HeroEntity | null = null;
  moveAccumulator = 0;
  /**
   * Steps advanced past "reached my own front line, aligned with the
   * target's column" - what lets a melee hero eventually fight through to
   * a surviving backline target instead of stalling forever once row/col
   * alignment alone isn't enough to close the remaining range. Persists
   * across re-targeting: it represents this hero having physically pushed
   * forward through the battle, not progress toward one specific enemy.
   */
  penetration = 0;
  readonly combat: CombatComponent;

  shieldHp = 0;
  private shieldTicksRemaining = 0;
  private effects: ActiveEffect[] = [];

  constructor(
    readonly instanceId: string,
    readonly side: PlayerSide,
    readonly hero: Hero,
    public col: 0 | 1 | 2,
    public row: 0 | 1
  ) {
    this.currentHp = hero.hp;
    this.combat = new CombatComponent(hero);
  }

  distanceTo(other: HeroEntity): number {
    const colDistance = Math.abs(this.col - other.col);
    const myDepth = this.row === 1 ? 0 : 1; // front row (1) is nearest the centerline
    const otherDepth = other.row === 1 ? 0 : 1;
    const raw = colDistance + myDepth + otherDepth + 1;
    return Math.max(1, raw - this.penetration);
  }

  /**
   * One discrete step toward being able to engage the current target: back
   * row pushes up to the front line first, then shifts toward the target's
   * column, then - once aligned but still out of range - keeps pushing
   * forward via `penetration`. Always makes progress while a target exists,
   * so no hero can ever get permanently stuck out of range. Returns
   * whether it actually changed anything, so a caller never has to emit a
   * move event for a no-op step.
   */
  advance(): boolean {
    if (this.row === 0) {
      this.row = 1;
      return true;
    }
    if (this.target && this.col !== this.target.col) {
      this.col = (this.col + (this.target.col > this.col ? 1 : -1)) as 0 | 1 | 2;
      return true;
    }
    this.penetration += 1;
    return true;
  }

  /** Shield absorbs before HP does. */
  takeDamage(amount: number): void {
    const absorbed = Math.min(this.shieldHp, amount);
    this.shieldHp -= absorbed;
    const remaining = amount - absorbed;

    this.currentHp = Math.max(0, this.currentHp - remaining);
    if (this.currentHp <= 0) {
      this.alive = false;
      this.aiState = "DEAD";
    }
  }

  heal(amount: number): void {
    this.currentHp = Math.min(this.hero.hp, this.currentHp + amount);
  }

  addShield(amount: number, durationTicks: number): void {
    this.shieldHp += amount;
    this.shieldTicksRemaining = Math.max(this.shieldTicksRemaining, durationTicks);
  }

  /** Replaces any existing effect of the same kind+stat rather than stacking. */
  addEffect(effect: ActiveEffect): void {
    this.effects = [
      ...this.effects.filter((existing) => !(existing.kind === effect.kind && existing.stat === effect.stat)),
      effect,
    ];
  }

  get isFrozen(): boolean {
    return this.effects.some((effect) => effect.kind === "freeze");
  }

  getEffectiveMovementSpeed(): number {
    const slow = this.effects.find((effect) => effect.kind === "slow");
    return slow ? this.hero.movementSpeed * (1 - slow.power) : this.hero.movementSpeed;
  }

  getEffectiveStat(stat: SkillStat): number {
    const base = stat === "attack" ? this.hero.attack : this.hero.defense;
    const buff = this.effects.find((effect) => effect.kind === "buff" && effect.stat === stat);
    return buff ? base * (1 + buff.power) : base;
  }

  /** Ticks down shield expiry and all active effects, removing anything expired. Called once per hero per simulation tick, regardless of what else it does that tick. */
  tickStatusEffects(): void {
    if (this.shieldTicksRemaining > 0) {
      this.shieldTicksRemaining -= 1;
      if (this.shieldTicksRemaining <= 0) {
        this.shieldHp = 0;
      }
    }

    this.effects = this.effects
      .map((effect) => ({ ...effect, remainingTicks: effect.remainingTicks - 1 }))
      .filter((effect) => effect.remainingTicks > 0);
  }
}
