import type { Ability, BattleEvent, BattleResult, Formation, Hero, PlayerSide } from "@battle-formation/shared-types";
import { createRng } from "../rng";
import { MAX_TICKS, MOVEMENT_STEP_COST, TICK_RATE } from "./constants";
import { calculateDamage } from "./DamageCalculator";
import { HeroEntity } from "./HeroEntity";
import { BehaviorRegistry, type BehaviorContext } from "./ai";
import { SkillManager, type SkillCastContext } from "./skills";

export type BattleState = "PREPARATION" | "BATTLE_START" | "COMBAT" | "VICTORY" | "DEFEAT";

/**
 * Deterministic tick-based battle simulator. Same two formations + same
 * hero stats + same seed always produce the same event log and outcome -
 * required so the backend and every client compute an identical result
 * without trusting each other. Determinism is enforced by construction:
 * no Math.random/Date.now anywhere in this module, heroes always act in
 * one fixed order every tick (side A in slot order, then side B in slot
 * order), and the only tie-break path (simultaneous elimination, or the
 * MAX_TICKS safety cap) is a pure function of remaining HP - never
 * iteration order or object-key order.
 *
 * VICTORY/DEFEAT are relative to `perspective` (which side "we" are - the
 * local player when this runs client-side). The underlying result
 * (BattleResult.winner) is always the objective playerA/playerB outcome,
 * unaffected by perspective.
 *
 * Each hero's actual decisions (who to fight, whether to advance) come
 * from a HeroBehavior resolved through `behaviors` (see ai/), not from
 * anything hardcoded in this class - BattleManager only runs the state
 * machine (IDLE/SEARCH_TARGET/MOVE/ATTACK/CAST_SKILL/DEAD) and executes
 * whatever the behavior decided. Ability effects work the same way, one
 * level deeper: `skills` (see skills/) dispatches each cast to the
 * executor for its `ability.kind` - BattleManager only provides the
 * SkillEffects callbacks (dealDamage/heal/applyShield/...) that keep
 * event-emitting and outcome-checking centralized here.
 */
export class BattleManager {
  private state: BattleState = "PREPARATION";
  private currentTick = 0;
  private winner: PlayerSide | null = null;
  private readonly events: BattleEvent[] = [];
  private readonly entities: HeroEntity[];
  // Reserved for deterministic damage variance/crit rolls in a future pass;
  // the current formula-only combat doesn't consume it, but the seed still
  // flows through the constructor so multiplayer callers don't need to
  // change anything when that lands.
  private readonly rng: () => number;

  constructor(
    formationA: Formation,
    formationB: Formation,
    heroesByInstanceId: Map<string, Hero>,
    seed: number,
    private readonly perspective: PlayerSide = "playerA",
    private readonly behaviors: BehaviorRegistry = new BehaviorRegistry(),
    private readonly skills: SkillManager = new SkillManager()
  ) {
    this.rng = createRng(seed);
    this.entities = [
      ...this.buildEntities(formationA, "playerA", heroesByInstanceId),
      ...this.buildEntities(formationB, "playerB", heroesByInstanceId),
    ];
  }

  private buildEntities(
    formation: Formation,
    side: PlayerSide,
    heroesByInstanceId: Map<string, Hero>
  ): HeroEntity[] {
    return formation.slots
      .slice()
      .sort((a, b) => a.row - b.row || a.col - b.col)
      .map((slot) => {
        const hero = heroesByInstanceId.get(slot.instanceId);
        if (!hero) {
          throw new Error(`No hero data for instance "${slot.instanceId}"`);
        }
        return new HeroEntity(slot.instanceId, side, hero, slot.col, slot.row);
      });
  }

  getState(): BattleState {
    return this.state;
  }

  getTick(): number {
    return this.currentTick;
  }

  getEvents(): BattleEvent[] {
    return this.events;
  }

  /** PREPARATION -> BATTLE_START -> COMBAT. Emits one spawn event per hero. */
  start(): void {
    if (this.state !== "PREPARATION") return;
    this.state = "BATTLE_START";

    for (const entity of this.entities) {
      this.events.push({
        type: "spawn",
        tick: this.currentTick,
        instanceId: entity.instanceId,
        col: entity.col,
        row: entity.row,
      });
    }

    this.state = "COMBAT";
  }

  /** Advances the simulation by one tick. No-op once the battle has ended. */
  tick(): void {
    if (this.state !== "COMBAT") return;
    this.currentTick += 1;

    for (const entity of this.entities) {
      if (!entity.alive) continue;
      this.act(entity);
      if (this.state !== "COMBAT") return; // an action this tick ended the battle
    }

    if (this.currentTick >= MAX_TICKS) {
      this.finish();
    }
  }

  /** Runs PREPARATION through VICTORY/DEFEAT in one call and returns the result. */
  run(): BattleResult {
    this.start();
    while (this.state === "COMBAT") {
      this.tick();
    }
    return this.getResult();
  }

  getResult(): BattleResult {
    if (!this.winner) {
      throw new Error("Battle has not finished yet");
    }
    return { winner: this.winner, durationTicks: this.currentTick, events: this.events };
  }

  /**
   * One hero's turn through the AI state machine:
   *   IDLE (frozen)                    <- always checked first, after cooldowns/effects tick
   *   SEARCH_TARGET (no valid target) -> MOVE (out of range, behavior says advance)
   *                                    -> IDLE (out of range, behavior says hold)
   *                                    -> CAST_SKILL (in range, an ability is ready)
   *                                    -> ATTACK (in range, basic attack off cooldown)
   *                                    -> IDLE (in range, everything on cooldown)
   * Exactly one state - and therefore one action - per hero per tick.
   */
  private act(entity: HeroEntity): void {
    entity.combat.tickDown();
    entity.tickStatusEffects();

    if (entity.isFrozen) {
      entity.aiState = "IDLE"; // frozen: cooldowns/effects still ticked above, just no action this turn
      return;
    }

    const behavior = this.behaviors.resolve(entity.hero);
    const context: BehaviorContext = {
      self: entity,
      enemies: this.entities.filter((candidate) => candidate.side !== entity.side),
      allies: this.entities.filter((candidate) => candidate.side === entity.side && candidate !== entity),
    };

    if (!entity.target || !entity.target.alive) {
      entity.aiState = "SEARCH_TARGET";
      entity.target = behavior.selectTarget(context);
    }

    const target = entity.target;
    if (!target) {
      entity.aiState = "IDLE"; // no living enemies left; checkOutcome will already have ended the battle
      return;
    }

    const inRange = entity.distanceTo(target) <= entity.hero.range;
    if (!inRange) {
      if (behavior.shouldAdvance(context)) {
        entity.aiState = "MOVE";
        this.advanceToward(entity);
      } else {
        entity.aiState = "IDLE"; // holding position (e.g. a ranged hero waiting for the enemy to close in)
      }
      return;
    }

    const ability = entity.combat.readyAbility();
    if (ability) {
      entity.aiState = "CAST_SKILL";
      entity.combat.startAbilityCooldown(ability);
      const result = this.skills.cast(this.buildSkillContext(entity, ability));
      this.events.push({
        type: "ability",
        tick: this.currentTick,
        sourceId: entity.instanceId,
        abilityId: ability.id,
        targetIds: result.targetIds,
      });
      return; // an ability cast is this tick's one action, in place of a basic attack
    }

    if (entity.combat.canAttack()) {
      entity.aiState = "ATTACK";
      entity.combat.startAttackCooldown();
      const damage = calculateDamage(entity.getEffectiveStat("attack"), target.getEffectiveStat("defense"));
      this.events.push({
        type: "attack",
        tick: this.currentTick,
        sourceId: entity.instanceId,
        targetId: target.instanceId,
        damage,
      });
      this.applyDamage(target, damage);
      return;
    }

    entity.aiState = "IDLE"; // in range, but the basic attack is still on cooldown
  }

  private advanceToward(entity: HeroEntity): void {
    entity.moveAccumulator += entity.getEffectiveMovementSpeed();
    if (entity.moveAccumulator < MOVEMENT_STEP_COST) return;

    entity.moveAccumulator -= MOVEMENT_STEP_COST;
    if (!entity.advance()) return;

    this.events.push({
      type: "move",
      tick: this.currentTick,
      instanceId: entity.instanceId,
      toCol: entity.col,
      toRow: entity.row,
    });
  }

  /**
   * Builds the caster's view of the battle for one skill cast: who's
   * available to target, and the effect callbacks that mutate real state.
   * The callbacks are the only place `ability.duration` gets converted
   * from seconds to ticks - skills themselves never touch TICK_RATE.
   */
  private buildSkillContext(caster: HeroEntity, ability: Ability): SkillCastContext {
    const durationTicks = Math.round((ability.duration ?? 0) * TICK_RATE);

    return {
      caster,
      ability,
      allies: this.entities.filter((entity) => entity.side === caster.side && entity.alive),
      enemies: this.entities.filter((entity) => entity.side !== caster.side && entity.alive),
      effects: {
        dealDamage: (target, amount) => this.applyDamage(target, amount),
        heal: (target, amount) => target.heal(amount),
        applyShield: (target, amount) => target.addShield(amount, durationTicks),
        applyBuff: (target, stat, power) => target.addEffect({ kind: "buff", stat, power, remainingTicks: durationTicks }),
        applyFreeze: (target) => target.addEffect({ kind: "freeze", power: 1, remainingTicks: durationTicks }),
        applySlow: (target, power) => target.addEffect({ kind: "slow", power, remainingTicks: durationTicks }),
      },
    };
  }

  private applyDamage(target: HeroEntity, amount: number): void {
    target.takeDamage(amount);
    if (!target.alive) {
      this.events.push({ type: "death", tick: this.currentTick, instanceId: target.instanceId });
      this.checkOutcome();
    }
  }

  private checkOutcome(): void {
    if (this.state !== "COMBAT") return;
    const aAlive = this.entities.some((entity) => entity.side === "playerA" && entity.alive);
    const bAlive = this.entities.some((entity) => entity.side === "playerB" && entity.alive);
    if (aAlive && bAlive) return;
    this.finish();
  }

  private finish(): void {
    if (this.state !== "COMBAT") return;

    const aAlive = this.entities.some((entity) => entity.side === "playerA" && entity.alive);
    const bAlive = this.entities.some((entity) => entity.side === "playerB" && entity.alive);
    const winner = this.resolveWinner(aAlive, bAlive);

    this.winner = winner;
    this.events.push({ type: "victory", tick: this.currentTick, winner });
    this.state = winner === this.perspective ? "VICTORY" : "DEFEAT";
  }

  private resolveWinner(aAlive: boolean, bAlive: boolean): PlayerSide {
    if (aAlive && !bAlive) return "playerA";
    if (bAlive && !aAlive) return "playerB";

    // Neither/both sides have survivors at the MAX_TICKS cap: deterministic
    // tiebreak by total remaining HP rather than leaving it undecided.
    const remainingHp = (side: PlayerSide) =>
      this.entities
        .filter((entity) => entity.side === side && entity.alive)
        .reduce((sum, entity) => sum + entity.currentHp, 0);

    return remainingHp("playerA") >= remainingHp("playerB") ? "playerA" : "playerB";
  }
}
