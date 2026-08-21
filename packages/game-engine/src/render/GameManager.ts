import type {
  BattleEvent,
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
 * what it's told, and the bridge module just moves bytes.
 */
export class GameManager {
  /** Every hero in the match (both sides), resolved to combat stats once at LOAD_HEROES. */
  private heroesByInstanceId = new Map<string, Hero>();
  private sideByInstanceId = new Map<string, PlayerSide>();
  /** Just the local side's roster - what the formation bench displays. */
  private localRoster: RosterHero[] = [];
  private localSide: PlayerSide = "playerA";
  private formations: [Formation, Formation] | null = null;

  constructor(
    private readonly phaserGame: PhaserGame,
    private readonly send: Send
  ) {}

  handleInboundMessage(message: BridgeInboundMessage): void {
    switch (message.type) {
      case "ACK_READY":
        break;
      case "LOAD_HEROES":
        this.loadHeroes(message.payload.heroes, message.payload.localSide ?? "playerA");
        break;
      case "START_FORMATION_PHASE":
        this.phaserGame.startFormationPhase(
          this.localRoster,
          message.payload.durationSeconds,
          (formation) => {
            this.send({ type: "FORMATION_CONFIRMED", payload: { formation } });
          },
          this.localSide
        );
        break;
      case "SET_FORMATION":
        this.formations = message.payload.formations;
        this.phaserGame.setFormation(this.formations);
        break;
      case "START_BATTLE":
        this.startBattle(message.payload.seed);
        break;
      case "PLAY_BATTLE":
        this.playServerBattle(message.payload.events, message.payload.winner, message.payload.rewards);
        break;
    }
  }

  private loadHeroes(heroes: RosterHero[], localSide: PlayerSide): void {
    this.localSide = localSide;
    this.heroesByInstanceId = new Map(
      heroes.map((rosterHero) => [rosterHero.instanceId, resolveHero(rosterHero.definition, rosterHero.level)])
    );
    this.sideByInstanceId = new Map(heroes.map((rosterHero) => [rosterHero.instanceId, rosterHero.side]));
    this.localRoster = heroes.filter((rosterHero) => rosterHero.side === localSide).slice(0, 6);
    this.phaserGame.setHeroCatalog(heroes.map((rosterHero) => rosterHero.definition));
    this.phaserGame.setSideLookup(this.sideByInstanceId);
    this.phaserGame.setClassLookup(
      new Map(heroes.map((rosterHero) => [rosterHero.instanceId, rosterHero.definition.class]))
    );
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
    }, this.localSide);
  }

  private playServerBattle(events: BattleEvent[], winner: PlayerSide, rewards: BattleRewards): void {
    this.phaserGame.playBattle(
      events,
      () => {
        this.send({ type: "BATTLE_FINISHED", payload: { winner, rewards } });
      },
      this.localSide
    );
  }

  // Offline / practice fallback only - online matches use PLAY_BATTLE rewards.
  private calculateRewards(winner: PlayerSide): BattleRewards {
    return winner === this.localSide ? { gold: 100, experience: 50 } : { gold: 25, experience: 10 };
  }
}
