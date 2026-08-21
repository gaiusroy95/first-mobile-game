import type { PlayerSide } from "./battle";
import type { ArmyRole, FactionId } from "./faction";

export type HeroClass =
  | "commander"
  | "tank"
  | "knight"
  | "archer"
  | "fire-mage"
  | "ice-mage"
  | "assassin"
  | "healer";

export type HeroRarity = "common" | "rare" | "epic" | "legendary";

/**
 * The set of effects the simulation actually knows how to execute - one
 * SkillManager executor per kind (see game-engine's battle/skills/), never
 * one per ability id. A new skill of an existing kind (a second Fireball
 * with different numbers) is pure data; only a genuinely new kind of
 * effect needs a new executor.
 */
export type SkillKind = "damage" | "heal" | "shield" | "buff" | "freeze" | "slow";

/** Which combat stat a "buff" ability modifies. */
export type SkillStat = "attack" | "defense";

export interface Ability {
  id: string;
  name: string;
  description: string;
  /** Seconds before it can be used again. */
  cooldown: number;
  kind: SkillKind;
  /**
   * Magnitude - meaning depends on `kind`: for damage/heal, a multiplier of
   * the caster's attack stat; for shield, a multiplier of attack that sets
   * the flat HP absorbed; for buff/slow, a fractional stat change (0.3 =
   * +/-30%). Unused by freeze, which is a pure on/off effect.
   */
  power?: number;
  /** Extra columns out from the primary target also affected. Omitted/0 = single target. */
  radius?: number;
  /** How long the effect lasts, in seconds. Required for shield/buff/freeze/slow; ignored by damage/heal. */
  duration?: number;
  /** buff only: which stat it modifies. */
  stat?: SkillStat;
}

export interface HeroBaseStats {
  hp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  range: number;
  movementSpeed: number;
}

/**
 * Static template stored in the hero database - not level-scaled. This is
 * the only shape new content ever needs to produce: HeroLoader/HeroManager
 * and the simulation are written entirely against this interface and
 * `HeroClass`, never against a specific hero id or class, so adding a hero
 * (even a new class) never requires touching any of that code.
 */
export interface HeroDefinition {
  id: string;
  name: string;
  class: HeroClass;
  rarity: HeroRarity;
  faction: FactionId;
  /** Commander = unique leader. Unit = regular army soldier. */
  role: ArmyRole;
  baseStats: HeroBaseStats;
  abilities: Ability[];
  /** Not granted or selectable until art/rules land. */
  locked?: boolean;
}

/** Resolved, level-scaled hero ready for battle - what HeroManager.createHero produces. */
export interface Hero {
  id: string;
  name: string;
  class: HeroClass;
  faction: FactionId;
  role: ArmyRole;
  hp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  range: number;
  movementSpeed: number;
  abilities: Ability[];
  rarity: HeroRarity;
  level: number;
}

/** A hero a player owns - collection/progression state, not combat stats. */
export interface OwnedHero {
  instanceId: string;
  heroId: string;
  level: number;
  upgrades: string[];
  /** Equipped cosmetic skin (visual only). */
  cosmeticId?: string;
}

/**
 * A specific hero instance participating in a match: which side it belongs
 * to, its template, and its level (combat stats are resolved from these via
 * `resolveHero`, never carried directly - level-scaling has one
 * implementation, not one per caller).
 */
export interface RosterHero {
  instanceId: string;
  side: PlayerSide;
  definition: HeroDefinition;
  level: number;
}

/** Position on the 3x2 formation grid (col 0-2 from own back line, row 0-1). */
export interface FormationSlot {
  instanceId: string;
  col: 0 | 1 | 2;
  row: 0 | 1;
}

export interface Formation {
  playerId: string;
  slots: FormationSlot[];
}
