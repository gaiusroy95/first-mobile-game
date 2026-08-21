import Phaser from "phaser";
import type { Formation, PlayerSide, RosterHero } from "@battle-formation/shared-types";
import { allSlots, validateFormation } from "../../simulation/formation";
import { GridManager } from "../systems/GridManager";
import { PositionManager } from "../systems/PositionManager";
import { HeroPlacement } from "../systems/HeroPlacement";
import { PrepTimer } from "../systems/PrepTimer";
import { createHeroAnimations, generatePlaceholders, preloadAssets } from "../assets";

/**
 * The preparation phase: draws both sides' 3x2 grids, lets the player drag
 * their roster onto their own side, runs the 20s timer, and validates +
 * emits the finished Formation. Everything interactive (GridManager,
 * PositionManager, HeroPlacement, the timer) is composed here rather than
 * built into the scene itself, so each piece stays independently testable.
 */
export class FormationScene extends Phaser.Scene {
  private grid?: GridManager;
  private position?: PositionManager;
  private placement?: HeroPlacement;
  private readonly timer = new PrepTimer();
  private slotRects: Phaser.GameObjects.Rectangle[] = [];

  private timerText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;

  private onConfirmed?: (formation: Formation) => void;
  private confirmed = false;
  private localSide: PlayerSide = "playerA";
  private localRoster: RosterHero[] = [];
  private pendingPrep?: {
    roster: RosterHero[];
    durationSeconds: number;
    onConfirmed: (formation: Formation) => void;
    localSide: PlayerSide;
  };

  constructor() {
    super("Formation");
  }

  /**
   * Queues real-asset loads (a no-op today - see assets/AssetManifest.ts,
   * nothing has a `source` wired in yet). Must run in `preload()`, not
   * `create()`: Phaser only auto-processes `scene.load.*` calls queued
   * here, so this is also where a real spritesheet would need to be
   * requested once one exists.
   */
  preload(): void {
    preloadAssets(this);
  }

  create(): void {
    // Every hero/effect/UI key used below now resolves to a texture -
    // either the real asset `preload()` just finished loading, or (today,
    // always) a generated placeholder filling the gap. Callers never need
    // to know which.
    generatePlaceholders(this);
    createHeroAnimations(this);

    this.cameras.main.setBackgroundColor("#0b1210");
    this.grid = new GridManager({
      viewportWidth: this.scale.width,
      viewportHeight: this.scale.height,
    });
    this.drawGridSlots();

    this.timerText = this.add
      .text(this.scale.width / 2, 16, "", { fontSize: "20px", color: "#d4a84b", fontStyle: "bold" })
      .setOrigin(0.5, 0);
    this.statusText = this.add
      .text(this.scale.width / 2, 44, "Drag heroes onto YOUR grid (bottom)", {
        fontSize: "12px",
        color: "#c8b8a4",
        align: "center",
        wordWrap: { width: this.scale.width - 40 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(this.scale.width / 2, this.scale.height * 0.12, "ENEMY", {
        fontSize: "11px",
        color: "#64748b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(this.scale.width / 2, this.scale.height * 0.78, "YOU · front row faces center", {
        fontSize: "11px",
        color: "#d4a84b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const btnY = this.scale.height - 36;
    const btn = this.add.rectangle(this.scale.width / 2, btnY, 220, 40, 0xc45c26, 1).setInteractive({
      useHandCursor: true,
    });
    btn.setStrokeStyle(2, 0xd4a84b, 0.9);
    const btnLabel = this.add
      .text(this.scale.width / 2, btnY, "CONFIRM FORMATION", {
        fontSize: "13px",
        color: "#f5ebe0",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    btn.on("pointerover", () => btn.setFillStyle(0xd4682e));
    btn.on("pointerout", () => btn.setFillStyle(0xc45c26));
    btn.on("pointerup", () => this.confirm());
    void btnLabel;

    if (this.pendingPrep) {
      const pending = this.pendingPrep;
      this.pendingPrep = undefined;
      this.startPreparation(pending.roster, pending.durationSeconds, pending.onConfirmed, pending.localSide);
    }
  }

  private drawGridSlots(): void {
    if (!this.grid) return;
    for (const rect of this.slotRects) {
      rect.destroy();
    }
    this.slotRects = [];
    const size = this.grid.getCellSize() - 4;
    for (const side of ["playerA", "playerB"] as const) {
      for (const slot of allSlots()) {
        const { x, y } = this.grid.getSlotPosition(side, slot);
        const isLocal = side === this.localSide;
        const fill = isLocal ? 0x243528 : 0x3a2230;
        const stroke = isLocal ? 0xd4a84b : 0x64748b;
        this.slotRects.push(this.add.rectangle(x, y, size, size, fill, 0.75).setStrokeStyle(1.5, stroke, 0.7));
      }
    }
  }

  /** Called by PhaserGame once RN sends LOAD_HEROES + START_FORMATION_PHASE. */
  startPreparation(
    roster: RosterHero[],
    durationSeconds: number,
    onConfirmed: (formation: Formation) => void,
    localSide: PlayerSide = "playerA"
  ): void {
    if (!this.grid) {
      this.pendingPrep = { roster, durationSeconds, onConfirmed, localSide };
      return;
    }

    this.localSide = localSide;
    this.localRoster = roster;
    this.grid.setLocalSide(localSide);
    this.drawGridSlots();

    this.timer.stop();
    this.placement?.destroyTokens();
    this.confirmed = false;
    this.onConfirmed = onConfirmed;
    this.position = new PositionManager(localSide);
    this.placement = new HeroPlacement(this, this.grid, this.position, localSide, () =>
      this.refreshStatus()
    );
    this.placement.loadRoster(roster.slice(0, 6), this.scale.height - 96);
    this.refreshStatus();

    this.timer.start(
      durationSeconds,
      (secondsRemaining) => this.timerText?.setText(`${secondsRemaining}s`),
      () => {
        this.placement?.autoPlaceRemaining();
        this.confirm();
      }
    );
  }

  private refreshStatus(): void {
    if (!this.position || this.confirmed) return;
    const placed = allSlots().filter((slot) => this.position!.getOccupant(slot) !== undefined).length;
    this.statusText?.setText(`${placed} / 6 — Commander + 5 soldiers. Tanks front.`);
  }

  private confirm(): void {
    if (this.confirmed || !this.position || !this.onConfirmed) return;

    const formation = this.position.toFormation();
    const definitionByInstanceId = new Map(
      this.localRoster.map((hero) => [hero.instanceId, hero.definition] as const)
    );
    const result = validateFormation(formation, definitionByInstanceId);
    if (!result.valid) {
      this.statusText?.setText(result.errors[0] ?? "Place all 6 heroes first");
      return;
    }

    this.confirmed = true;
    this.timer.stop();
    const hint = result.warnings[0] ? ` · ${result.warnings[0]}` : "";
    this.statusText?.setText(`Locked in — waiting for opponent…${hint}`);
    this.onConfirmed(formation);
  }

  shutdown(): void {
    this.timer.stop();
    this.placement?.destroyTokens();
  }
}
