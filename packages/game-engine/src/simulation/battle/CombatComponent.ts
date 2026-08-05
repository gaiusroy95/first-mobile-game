import type { Ability, Hero } from "@battle-formation/shared-types";
import { TICK_RATE } from "./constants";

/**
 * Per-hero attack/ability timing. Cooldowns are tracked in ticks, not
 * wall-clock time, so a given hero's attack cadence and ability cadence
 * are entirely a function of its stats and the tick count - identical on
 * every machine that runs the same simulation.
 */
export class CombatComponent {
  private attackCooldownTicks = 0;
  private readonly abilityCooldownTicks = new Map<string, number>();

  constructor(private readonly hero: Hero) {}

  /** Advances all cooldowns by one tick. Called once per hero per simulation tick. */
  tickDown(): void {
    if (this.attackCooldownTicks > 0) {
      this.attackCooldownTicks -= 1;
    }
    for (const [abilityId, remaining] of this.abilityCooldownTicks) {
      if (remaining > 0) {
        this.abilityCooldownTicks.set(abilityId, remaining - 1);
      }
    }
  }

  canAttack(): boolean {
    return this.attackCooldownTicks <= 0;
  }

  startAttackCooldown(): void {
    this.attackCooldownTicks = Math.max(1, Math.round(TICK_RATE / this.hero.attackSpeed));
  }

  /** First ability off cooldown, in the hero's fixed ability order. Null if none ready. */
  readyAbility(): Ability | null {
    return (
      this.hero.abilities.find((ability) => (this.abilityCooldownTicks.get(ability.id) ?? 0) <= 0) ?? null
    );
  }

  startAbilityCooldown(ability: Ability): void {
    this.abilityCooldownTicks.set(ability.id, Math.round(ability.cooldown * TICK_RATE));
  }
}
