import Phaser from "phaser";
import type { BattleEvent, Formation, HeroClass, HeroDefinition, PlayerSide } from "@battle-formation/shared-types";
import { TICK_RATE } from "../../simulation/battle/constants";
import { coordinateToSlot } from "../../simulation/formation/grid";
import { GridManager } from "../systems/GridManager";
import { HERO_SPRITES, EFFECT_SPRITES, createHeroAnimations, generatePlaceholders, preloadAssets } from "../assets";
import { SoundManager } from "../assets";

interface UnitView {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  hpBar: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  side: PlayerSide;
  maxHp: number;
  currentHp: number;
}

const TOKEN_SIZE = 48;
/** Playback speed: real ms per simulated tick. */
const MS_PER_TICK = 1000 / TICK_RATE;

const CLASS_LABEL: Record<string, string> = {
  commander: "CMD",
  tank: "TNK",
  knight: "KNT",
  archer: "ARC",
  "fire-mage": "FIR",
  "ice-mage": "ICE",
  assassin: "ASN",
  healer: "HLR",
};

/**
 * Plays a deterministic battle event log with readable units, draining HP
 * bars, floating numbers, and procedural SFX.
 */
export class BattleScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text;
  private youLabel?: Phaser.GameObjects.Text;
  private foeLabel?: Phaser.GameObjects.Text;
  private heroCatalog: HeroDefinition[] = [];
  private sideByInstanceId = new Map<string, PlayerSide>();
  private classByInstanceId = new Map<string, HeroClass>();
  private units = new Map<string, UnitView>();
  private grid?: GridManager;
  private sounds?: SoundManager;
  private pendingPlayback?: { events: BattleEvent[]; onComplete: () => void };
  private playbackToken = 0;
  private localSide: PlayerSide = "playerA";

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

    this.cameras.main.setBackgroundColor("#0b1210");
    this.grid = new GridManager({
      viewportWidth: this.scale.width,
      viewportHeight: this.scale.height,
    });
    this.drawArena();

    this.statusText = this.add
      .text(this.scale.width / 2, 14, "Battle", {
        fontSize: "15px",
        color: "#f5ebe0",
        fontStyle: "bold",
      })
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

  setLocalSide(side: PlayerSide): void {
    this.localSide = side;
    this.youLabel?.setText(side === "playerA" ? "YOU" : "ENEMY");
    this.foeLabel?.setText(side === "playerA" ? "ENEMY" : "YOU");
  }

  setFormation(formations: [Formation, Formation]): void {
    void formations;
    this.statusText?.setText("Formations locked — fight!");
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
    this.statusText.setText("Battle in progress…");
    this.sounds?.play("music.battle");

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
      const delay = nextTick === undefined ? 450 : Math.max(35, (nextTick - currentTick) * MS_PER_TICK);
      this.time.delayedCall(delay, step);
    };

    step();
  }

  private applyEvent(event: BattleEvent): void {
    switch (event.type) {
      case "spawn":
        this.spawnUnit(event);
        break;
      case "move":
        this.moveUnit(event.instanceId, event.toCol, event.toRow);
        break;
      case "attack":
        this.flashAttack(event.sourceId, event.targetId, event.damage, event.remainingHp);
        this.sounds?.play("sfx.attack");
        break;
      case "damage":
        this.applyHp(event.targetId, event.remainingHp, event.amount, false);
        this.sounds?.play("sfx.attack");
        break;
      case "heal":
        this.applyHp(event.targetId, event.remainingHp, event.amount, true);
        break;
      case "ability":
        this.flashAbility(event.sourceId, event.targetIds);
        this.sounds?.play("sfx.ability");
        break;
      case "death":
        this.killUnit(event.instanceId);
        this.sounds?.play("sfx.death");
        break;
      case "victory": {
        const youWon = event.winner === this.localSide;
        this.statusText?.setText(youWon ? "Victory!" : "Defeat");
        this.sounds?.play(youWon ? "sfx.victory" : "sfx.defeat");
        break;
      }
    }
  }

  private spawnUnit(event: Extract<BattleEvent, { type: "spawn" }>): void {
    if (!this.grid) return;
    const instanceId = event.instanceId;
    const side = this.sideByInstanceId.get(instanceId) ?? "playerA";
    const heroClass = (event.heroClass as HeroClass) || this.classByInstanceId.get(instanceId) || this.inferClass(instanceId);
    this.classByInstanceId.set(instanceId, heroClass);

    const slot = coordinateToSlot(event.col as 0 | 1 | 2, event.row as 0 | 1);
    const { x, y } = this.grid.getSlotPosition(side, slot);

    const sprite = this.add.sprite(0, 0, HERO_SPRITES[heroClass].key);
    const short = CLASS_LABEL[heroClass] ?? heroClass.slice(0, 3).toUpperCase();
    const label = this.add
      .text(0, 18, short, {
        fontSize: "9px",
        color: "#f5ebe0",
        fontStyle: "bold",
        backgroundColor: "#00000088",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5);
    const hpBar = this.add.graphics();
    const maxHp = Math.max(1, event.maxHp ?? 1);
    this.drawHpBar(hpBar, 1);

    const ring = this.add.circle(0, 0, 26, side === "playerA" ? 0xc45c26 : 0x3d5a80, 0.18);
    ring.setStrokeStyle(2, side === this.localSide ? 0xd4a84b : 0x94a3b8, 0.85);

    const container = this.add.container(x, y, [ring, sprite, hpBar, label]);
    container.setSize(TOKEN_SIZE, TOKEN_SIZE);
    this.units.set(instanceId, {
      container,
      sprite,
      hpBar,
      label,
      side,
      maxHp,
      currentHp: maxHp,
    });
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

  private flashAttack(sourceId: string, targetId: string, damage: number, remainingHp: number): void {
    const source = this.units.get(sourceId);
    const target = this.units.get(targetId);
    if (source && target) {
      const ox = source.container.x;
      const oy = source.container.y;
      const dx = (target.container.x - ox) * 0.18;
      const dy = (target.container.y - oy) * 0.18;
      this.tweens.add({
        targets: source.container,
        x: ox + dx,
        y: oy + dy,
        yoyo: true,
        duration: 90,
        ease: "Quad.easeOut",
      });
    } else if (source) {
      this.tweens.add({
        targets: source.container,
        scale: 1.12,
        yoyo: true,
        duration: 90,
      });
    }
    this.applyHp(targetId, remainingHp, damage, false);
  }

  private applyHp(targetId: string, remainingHp: number, amount: number, isHeal: boolean): void {
    const target = this.units.get(targetId);
    if (!target) return;

    target.currentHp = Math.max(0, Math.min(target.maxHp, remainingHp));
    this.drawHpBar(target.hpBar, target.currentHp / target.maxHp);

    if (isHeal) {
      target.sprite.setTint(0x4ade80);
      this.time.delayedCall(140, () => target.sprite.clearTint());
      this.floatNumber(target.container.x, target.container.y - 20, `+${Math.round(amount)}`, "#4ade80");
      return;
    }

    target.sprite.setTint(0xef4444);
    this.time.delayedCall(120, () => target.sprite.clearTint());
    const flash = this.add.circle(target.container.x, target.container.y, 10, 0xef4444, 0.55);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.2,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
    this.floatNumber(target.container.x, target.container.y - 22, `-${Math.round(amount)}`, "#fecaca");
  }

  private floatNumber(x: number, y: number, text: string, color: string): void {
    const label = this.add
      .text(x, y, text, { fontSize: "14px", color, fontStyle: "bold", stroke: "#0b1210", strokeThickness: 3 })
      .setOrigin(0.5);
    this.tweens.add({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  private flashAbility(sourceId: string, targetIds: string[]): void {
    const source = this.units.get(sourceId);
    if (source) {
      const ring = this.add.circle(source.container.x, source.container.y, 8, 0xd4a84b, 0.75);
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 3.2,
        duration: 300,
        onComplete: () => ring.destroy(),
      });
    }
    for (const targetId of targetIds) {
      const target = this.units.get(targetId);
      if (!target) continue;
      const fx = this.add.sprite(target.container.x, target.container.y, EFFECT_SPRITES.buff.key);
      fx.setAlpha(0.85);
      this.tweens.add({
        targets: fx,
        alpha: 0,
        y: target.container.y - 26,
        duration: 340,
        onComplete: () => fx.destroy(),
      });
    }
  }

  private killUnit(instanceId: string): void {
    const unit = this.units.get(instanceId);
    if (!unit) return;
    this.drawHpBar(unit.hpBar, 0);
    this.tweens.add({
      targets: unit.container,
      alpha: 0,
      scale: 0.35,
      duration: 280,
      ease: "Back.easeIn",
      onComplete: () => {
        unit.container.destroy(true);
        this.units.delete(instanceId);
      },
    });
  }

  private drawHpBar(g: Phaser.GameObjects.Graphics, ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    g.clear();
    g.fillStyle(0x1a1a1a, 0.95);
    g.fillRoundedRect(-20, -30, 40, 6, 2);
    const color = clamped > 0.5 ? 0x22c55e : clamped > 0.25 ? 0xd4a84b : 0xef4444;
    g.fillStyle(color, 1);
    g.fillRoundedRect(-20, -30, 40 * clamped, 6, 2);
  }

  private clearUnits(): void {
    for (const unit of this.units.values()) {
      unit.container.destroy(true);
    }
    this.units.clear();
  }

  private drawArena(): void {
    if (!this.grid) return;
    const w = this.scale.width;
    const h = this.scale.height;

    // Atmosphere bands
    this.add.rectangle(w / 2, h * 0.28, w, h * 0.42, 0x1a1018, 0.55);
    this.add.rectangle(w / 2, h * 0.72, w, h * 0.42, 0x12180f, 0.55);

    // Center clash line
    const mid = this.add.rectangle(w / 2, h / 2, w * 0.72, 3, 0xd4a84b, 0.55);
    mid.setDepth(0);
    this.add
      .text(w / 2, h / 2, "⚔", { fontSize: "12px" })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.foeLabel = this.add
      .text(w / 2, h * 0.12, "ENEMY", {
        fontSize: "11px",
        color: "#94a3b8",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.youLabel = this.add
      .text(w / 2, h * 0.88, "YOU", {
        fontSize: "11px",
        color: "#d4a84b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const sides: PlayerSide[] = ["playerA", "playerB"];
    for (const side of sides) {
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 2; row++) {
          const slot = coordinateToSlot(col as 0 | 1 | 2, row as 0 | 1);
          const { x, y } = this.grid.getSlotPosition(side, slot);
          const size = this.grid.getCellSize() * 0.88;
          const isLocal = side === this.localSide;
          const fill = side === "playerA" ? 0x243528 : 0x3a2230;
          const rect = this.add.rectangle(x, y, size, size, fill, 0.72);
          rect.setStrokeStyle(1.5, isLocal ? 0xd4a84b : 0x64748b, 0.65);
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
    return "tank";
  }
}
