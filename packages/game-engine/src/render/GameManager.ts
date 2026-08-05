import type {
  BattleRewards,
  BridgeInboundMessage,
  BridgeOutboundMessage,
  Formation,
  Hero,
  PlayerSide,
  RosterHero,
} from "@battle-formation/shared-types";
import { resolveHero, simulateBattle } from "../simulation";
import type { PhaserGame } from "./PhaserGame";

type Send = (message: BridgeOutboundMessage) => void;

/**
 * The single orchestrator of game state and flow on the Phaser side.
 * GameManager is the only thing that reads bridge commands and the only
 * thing that decides what the game does with them - PhaserGame just draws
 * what it's told, and the bridge module just moves bytes. Splitting these
 * three concerns is what makes it possible to unit-test battle flow
 * (LOAD_HEROES -> START_FORMATION_PHASE -> FORMATION_CONFIRMED ->
 * SET_FORMATION -> START_BATTLE -> BATTLE_FINISHED) without booting a real
 * Phaser.Game or a WebView at all.
 */
export class GameManager {
  /** Every hero in the match (both sides), resolved to combat stats once at LOAD_HEROES. */
  private heroesByInstanceId = new Map<string, Hero>();
  /** Just the local side's roster - what the formation bench displays. */
  private localRoster: RosterHero[] = [];
  private formations: [Formation, Formation] | null = null;

  constructor(
    private readonly phaserGame: PhaserGame,
    private readonly send: Send
  ) {}

  handleInboundMessage(message: BridgeInboundMessage): void {
    switch (message.type) {
      case "LOAD_HEROES":
        this.loadHeroes(message.payload.heroes);
        break;
      case "START_FORMATION_PHASE":
        this.phaserGame.startFormationPhase(
          this.localRoster,
          message.payload.durationSeconds,
          (formation) => {
            this.send({ type: "FORMATION_CONFIRMED", payload: { formation } });
          }
        );
        break;
      case "SET_FORMATION":
        this.formations = message.payload.formations;
        this.phaserGame.setFormation(this.formations);
        break;
      case "START_BATTLE":
        this.startBattle(message.payload.seed);
        break;
    }
  }

  private loadHeroes(heroes: RosterHero[]): void {
    this.heroesByInstanceId = new Map(
      heroes.map((rosterHero) => [rosterHero.instanceId, resolveHero(rosterHero.definition, rosterHero.level)])
    );
    this.localRoster = heroes.filter((rosterHero) => rosterHero.side === "playerA");
    this.phaserGame.setHeroCatalog(this.localRoster.map((rosterHero) => rosterHero.definition));
  }

  private startBattle(seed: number): void {
    if (!this.formations) {
      this.send({
        type: "RENDER_ERROR",
        payload: { message: "START_BATTLE received before SET_FORMATION" },
      });
      return;
    }

    const [formationA, formationB] = this.formations;
    const result = simulateBattle(formationA, formationB, this.heroesByInstanceId, seed);

    this.phaserGame.playBattle(result.events, () => {
      this.send({
        type: "BATTLE_FINISHED",
        payload: { winner: result.winner, rewards: this.calculateRewards(result.winner) },
      });
    });
  }

  // TODO(Phase 6): rewards move server-side once the backend exists, this
  // stays only as the single-player/offline fallback.
  private calculateRewards(winner: PlayerSide): BattleRewards {
    return winner === "playerA" ? { gold: 100, experience: 50 } : { gold: 25, experience: 10 };
  }
}
