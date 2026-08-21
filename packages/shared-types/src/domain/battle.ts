export type PlayerSide = "playerA" | "playerB";

/**
 * Wire format produced by the game-engine simulation and consumed by the
 * Phaser renderer. Adding a new event kind here is a compile error in both
 * the simulation and the renderer until handled on both sides.
 */
export type BattleEvent =
  | {
      type: "spawn";
      tick: number;
      instanceId: string;
      col: number;
      row: number;
      /** Max HP at battle start — renderer uses this to drive HP bars. */
      maxHp: number;
      heroClass: string;
      name: string;
    }
  | { type: "move"; tick: number; instanceId: string; toCol: number; toRow: number }
  | {
      type: "attack";
      tick: number;
      sourceId: string;
      targetId: string;
      damage: number;
      remainingHp: number;
    }
  /** Ability / effect damage that is not a basic attack lunge. */
  | { type: "damage"; tick: number; targetId: string; amount: number; remainingHp: number }
  | { type: "heal"; tick: number; targetId: string; amount: number; remainingHp: number }
  | { type: "ability"; tick: number; sourceId: string; abilityId: string; targetIds: string[] }
  | { type: "death"; tick: number; instanceId: string }
  | { type: "victory"; tick: number; winner: PlayerSide };

export interface BattleResult {
  winner: PlayerSide;
  durationTicks: number;
  events: BattleEvent[];
}

export interface BattleRewards {
  gold: number;
  experience: number;
  /** Signed trophy change for this recipient (win positive / loss negative). */
  trophyDelta?: number;
  heroCards?: { heroId: string; count: number }[];
  materials?: { materialId: string; count: number }[];
}

/**
 * Remaining team power used when the battle hits the time cap without a wipe.
 * Formula: sum over living heroes of (currentHp + attack * TEAM_POWER_ATTACK_WEIGHT).
 */
export const TEAM_POWER_ATTACK_WEIGHT = 2;
