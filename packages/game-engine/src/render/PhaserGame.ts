import Phaser from "phaser";
import type { BattleEvent, Formation, HeroDefinition, PlayerSide, RosterHero } from "@battle-formation/shared-types";
import { FormationScene } from "./scenes/FormationScene";
import { BattleScene } from "./scenes/BattleScene";

/**
 * Thin wrapper around the Phaser.Game instance. GameManager talks to the
 * renderer only through these methods - it never touches a Phaser.Scene,
 * sprite, or tween directly.
 */
export class PhaserGame {
  private readonly game: Phaser.Game;
  private formationScene?: FormationScene;
  private battleScene?: BattleScene;
  private sideByInstanceId = new Map<string, PlayerSide>();
  private classByInstanceId = new Map<string, import("@battle-formation/shared-types").HeroClass>();

  constructor(onReady: () => void) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-root",
      width: 360,
      height: 640,
      backgroundColor: "#0f172a",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [FormationScene],
    });

    this.game.events.once("ready", () => {
      this.formationScene = this.game.scene.getScene("Formation") as FormationScene;
      this.game.scene.add("Battle", BattleScene, false);
      this.battleScene = this.game.scene.getScene("Battle") as BattleScene;
      onReady();
    });
  }

  startFormationPhase(
    roster: RosterHero[],
    durationSeconds: number,
    onConfirmed: (formation: Formation) => void
  ): void {
    this.formationScene?.startPreparation(roster, durationSeconds, onConfirmed);
  }

  setHeroCatalog(heroes: HeroDefinition[]): void {
    this.battleScene?.setHeroCatalog(heroes);
  }

  setSideLookup(sideByInstanceId: Map<string, PlayerSide>): void {
    this.sideByInstanceId = sideByInstanceId;
    this.battleScene?.setSideLookup(sideByInstanceId);
  }

  setClassLookup(classByInstanceId: Map<string, import("@battle-formation/shared-types").HeroClass>): void {
    this.classByInstanceId = classByInstanceId;
    this.battleScene?.setClassLookup(classByInstanceId);
  }

  setFormation(formations: [Formation, Formation]): void {
    this.battleScene?.setFormation(formations);
  }

  playBattle(events: BattleEvent[], onComplete: () => void): void {
    this.game.scene.stop("Formation");
    this.game.scene.start("Battle");
    this.battleScene?.setSideLookup(this.sideByInstanceId);
    this.battleScene?.setClassLookup(this.classByInstanceId);
    this.battleScene?.playEvents(events, onComplete);
  }
}
