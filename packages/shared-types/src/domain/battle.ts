export type PlayerSide = "playerA" | "playerB";

/**
 * Wire format produced by the game-engine simulation and consumed by the
 * Phaser renderer. Adding a new event kind here is a compile error in both
 * the simulation and the renderer until handled on both sides.
 */
export type BattleEvent =
  | { type: "spawn"; tick: number; instanceId: string; col: number; row: number }
  | { type: "move"; tick: number; instanceId: string; toCol: number; toRow: number }
  | { type: "attack"; tick: number; sourceId: string; targetId: string; damage: number }
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
}
