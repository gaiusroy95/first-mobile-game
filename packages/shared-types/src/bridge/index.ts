import type { BattleEvent, BattleRewards, Formation, PlayerSide, RosterHero } from "../domain";

/**
 * React Native -> Phaser (posted into the WebView).
 * GameContainer sends these; GameManager is the only thing that reads them.
 */
export type BridgeInboundMessage =
  | { type: "LOAD_HEROES"; payload: { heroes: RosterHero[]; localSide?: PlayerSide } }
  | { type: "START_FORMATION_PHASE"; payload: { durationSeconds: number } }
  | { type: "SET_FORMATION"; payload: { formations: [Formation, Formation] } }
  | { type: "START_BATTLE"; payload: { seed: number } }
  /** Server-authoritative playback: skip local sim, animate the event log. */
  | {
      type: "PLAY_BATTLE";
      payload: { events: BattleEvent[]; winner: PlayerSide; rewards: BattleRewards };
    };

/**
 * Phaser -> React Native (received via WebView onMessage).
 * GameManager sends these; GameContainer is the only thing that reads them.
 */
export type BridgeOutboundMessage =
  | { type: "GAME_READY" }
  | { type: "FORMATION_CONFIRMED"; payload: { formation: Formation } }
  | { type: "BATTLE_FINISHED"; payload: { winner: PlayerSide; rewards: BattleRewards } }
  | { type: "RENDER_ERROR"; payload: { message: string } };
