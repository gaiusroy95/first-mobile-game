import Phaser from "phaser";
import type { BattleEvent, Formation, HeroClass, HeroDefinition, PlayerSide } from "@battle-formation/shared-types";
import { TICK_RATE } from "../../simulation/battle/constants";
import { coordinateToSlot } from "../../simulation/formation/grid";
import { GridManager } from "../systems/GridManager";
import { HERO_SPRITES, EFFECT_SPRITES, createHeroAnimations, generatePlaceholders, preloadAssets } from "../assets";

interface UnitView {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  hpBar: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  side: PlayerSide;
  maxHpHint: number;
}

const TOKEN_SIZE = 48;
/** Playback speed: real ms per simulated tick. */
const MS_PER_TICK = 1000 / TICK_RATE;

import { SoundManager } from "../assets";

/**
 * Plays a deterministic battle event log with placeholder units on the
 * mirrored boards.
 */
export class BattleScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text;
  private heroCatalog: HeroDefinition[] = [];
  private sideByInstanceId = new Map<string, PlayerSide>();
  private classByInstanceId = new Map<string, HeroClass>();
  private units = new Map<string, UnitView>();
  private grid?: GridManager;
  private sounds?: SoundManager;
  private pendingPlayback?: { events: BattleEvent[]; onComplete: () => void };
  private playbackToken = 0;

  constructor() {
    super("Battle");
  }

  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    generatePlaceholders(this);
    createHeroAnimations(this);
    this.sounds = new SoundManager(this);

    this.cameras.main.setBackgroundColor("#0f172a");
    this.grid = new GridManager({
      viewportWidth: this.scale.width,
      viewportHeight: this.scale.height,
    });
    this.drawBoards();

    this.statusText = this.add
      .text(this.scale.width / 2, 16, "Battle", { fontSize: "16px", color: "#f8fafc" })
      .setOrigin(0.5, 0);

    if (this.heroCatalog.length > 0) {
      this.setHeroCatalog(this.heroCatalog);
    }
    if (this.pendingPlayback) {
      const { events, onComplete } = this.pendingPlayback;
      this.pendingPlayback = undefined;
      this.playEvents(events, onComplete);
    }
  }

  setHeroCatalog(heroes: HeroDefinition[]): void {
    this.heroCatalog = heroes;
  }

  setSideLookup(sideByInstanceId: Map<string, PlayerSide>): void {
    this.sideByInstanceId = sideByInstanceId;
  }

  setClassLookup(classByInstanceId: Map<string, HeroClass>): void {
    this.classByInstanceId = classByInstanceId;
  }

  setFormation(formations: [Formation, Formation]): void {
    void formations;
    this.statusText?.setText("Formations locked — starting battle");
  }

  /** Plays an event log and invokes onComplete once playback finishes. */
  playEvents(events: BattleEvent[], onComplete: () => void): void {
    if (!this.statusText || !this.grid) {
      this.pendingPlayback = { events, onComplete };
      return;
    }

    this.playbackToken += 1;
    const token = this.playbackToken;
    this.clearUnits();
    this.statusText.setText("Battle in progress...");

    const sorted = [...events].sort((a, b) => a.tick - b.tick);
    let index = 0;

    const step = () => {
      if (token !== this.playbackToken) return;

      if (index >= sorted.length) {
        this.statusText?.setText("Battle finished");
        onComplete();
        return;
      }

      const currentTick = sorted[index]!.tick;
      while (index < sorted.length && sorted[index]!.tick === currentTick) {
        this.applyEvent(sorted[index]!);
        index += 1;
      }

      const nextTick = sorted[index]?.tick;
      const delay = nextTick === undefined ? 400 : Math.max(40, (nextTick - currentTick) * MS_PER_TICK);
      this.time.delayedCall(delay, step);
    };

    step();
  }

  private applyEvent(event: BattleEvent): void {
    switch (event.type) {
      case "spawn":
        this.spawnUnit(event.instanceId, event.col, event.row);
        break;
      case "move":
        this.moveUnit(event.instanceId, event.toCol, event.toRow);
        break;
      case "attack":
        this.flashAttack(event.sourceId, event.targetId, event.damage);
        this.sounds?.play("sfx.attack");
        break;
      case "ability":
        this.flashAbility(event.sourceId, event.targetIds);
        this.sounds?.play("sfx.ability");
        break;
      case "death":
        this.killUnit(event.instanceId);
        this.sounds?.play("sfx.death");
        break;
      case "victory":
        this.statusText?.setText(event.winner === "playerA" ? "Player A wins" : "Player B wins");
        this.sounds?.play("sfx.victory");
        break;
    }
  }

  private spawnUnit(instanceId: string, col: number, row: number): void {
    if (!this.grid) return;
    const side = this.sideByInstanceId.get(instanceId) ?? "playerA";
    const heroClass = this.classByInstanceId.get(instanceId) ?? this.inferClass(instanceId);
    this.classByInstanceId.set(instanceId, heroClass);

    const slot = coordinateToSlot(col as 0 | 1 | 2, row as 0 | 1);
    const { x, y } = this.grid.getSlotPosition(side, slot);

    const sprite = this.add.sprite(0, 0, HERO_SPRITES[heroClass].key);
    const label = this.add
      .text(0, 14, heroClass.slice(0, 2).toUpperCase(), { fontSize: "10px", color: "#ffffff" })
      .setOrigin(0.5);
    const hpBar = this.add.graphics();
    this.drawHpBar(hpBar, 1);

    const container = this.add.container(x, y, [sprite, hpBar, label]);
    container.setSize(TOKEN_SIZE, TOKEN_SIZE);
    this.units.set(instanceId, { container, sprite, hpBar, label, side, maxHpHint: 1 });
  }

  private moveUnit(instanceId: string, toCol: number, toRow: number): void {
    const unit = this.units.get(instanceId);
    if (!unit || !this.grid) return;
    const slot = coordinateToSlot(toCol as 0 | 1 | 2, toRow as 0 | 1);
    const { x, y } = this.grid.getSlotPosition(unit.side, slot);
    this.tweens.add({
      targets: unit.container,
      x,
      y,
      duration: MS_PER_TICK * 0.85,
      ease: "Sine.easeInOut",
    });
  }

  private flashAttack(sourceId: string, targetId: string, damage: number): void {
    const source = this.units.get(sourceId);
    const target = this.units.get(targetId);
    if (source) {
      this.tweens.add({
        targets: source.container,
        scale: 1.15,
        yoyo: true,
        duration: 90,
      });
    }
    if (target) {
      target.sprite.setTint(0xef4444);
      this.time.delayedCall(120, () => target.sprite.clearTint());
      const flash = this.add.circle(target.container.x, target.container.y, 10, 0xef4444, 0.6);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 200,
        onComplete: () => flash.destroy(),
      });
      void damage;
    }
  }

  private flashAbility(sourceId: string, targetIds: string[]): void {
    const source = this.units.get(sourceId);
    if (source) {
      const ring = this.add.circle(source.container.x, source.container.y, 8, 0xfacc15, 0.7);
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 3,
        duration: 280,
        onComplete: () => ring.destroy(),
      });
    }
    for (const targetId of targetIds) {
      const target = this.units.get(targetId);
      if (!target) continue;
      const fx = this.add.sprite(target.container.x, target.container.y, EFFECT_SPRITES.buff.key);
      fx.setAlpha(0.8);
      this.tweens.add({
        targets: fx,
        alpha: 0,
        y: target.container.y - 24,
        duration: 320,
        onComplete: () => fx.destroy(),
      });
    }
  }

  private killUnit(instanceId: string): void {
    const unit = this.units.get(instanceId);
    if (!unit) return;
    this.tweens.add({
      targets: unit.container,
      alpha: 0,
      scale: 0.4,
      duration: 220,
      onComplete: () => {
        unit.container.destroy(true);
        this.units.delete(instanceId);
      },
    });
  }

  private drawHpBar(g: Phaser.GameObjects.Graphics, ratio: number): void {
    g.clear();
    g.fillStyle(0x1e293b, 1);
    g.fillRect(-18, -28, 36, 5);
    g.fillStyle(0x22c55e, 1);
    g.fillRect(-18, -28, 36 * Math.max(0, Math.min(1, ratio)), 5);
  }

  private clearUnits(): void {
    for (const unit of this.units.values()) {
      unit.container.destroy(true);
    }
    this.units.clear();
  }

  private drawBoards(): void {
    if (!this.grid) return;
    const sides: PlayerSide[] = ["playerA", "playerB"];
    for (const side of sides) {
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 2; row++) {
          const slot = coordinateToSlot(col as 0 | 1 | 2, row as 0 | 1);
          const { x, y } = this.grid.getSlotPosition(side, slot);
          const size = this.grid.getCellSize() * 0.85;
          const rect = this.add.rectangle(x, y, size, size, side === "playerA" ? 0x1e3a5f : 0x3f1d2e, 0.55);
          rect.setStrokeStyle(1, 0x64748b, 0.8);
        }
      }
    }
  }

  private inferClass(instanceId: string): HeroClass {
    for (const definition of this.heroCatalog) {
      if (instanceId.includes(definition.id) || instanceId.includes(definition.class)) {
        return definition.class;
      }
    }
    // Prefer matching by loading class from side map callers — fallback tank.
    return "tank";
  }
}
