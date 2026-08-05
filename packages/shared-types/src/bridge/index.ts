import type { BattleRewards, Formation, PlayerSide, RosterHero } from "../domain";

/**
 * React Native -> Phaser (posted into the WebView).
 * GameContainer sends these; GameManager is the only thing that reads them.
 */
export type BridgeInboundMessage =
  | { type: "LOAD_HEROES"; payload: { heroes: RosterHero[] } }
  | { type: "START_FORMATION_PHASE"; payload: { durationSeconds: number } }
  | { type: "SET_FORMATION"; payload: { formations: [Formation, Formation] } }
  | { type: "START_BATTLE"; payload: { seed: number } };

/**
 * Phaser -> React Native (received via WebView onMessage).
 * GameManager sends these; GameContainer is the only thing that reads them.
 */
export type BridgeOutboundMessage =
  | { type: "GAME_READY" }
  | { type: "FORMATION_CONFIRMED"; payload: { formation: Formation } }
  | { type: "BATTLE_FINISHED"; payload: { winner: PlayerSide; rewards: BattleRewards } }
  | { type: "RENDER_ERROR"; payload: { message: string } };
