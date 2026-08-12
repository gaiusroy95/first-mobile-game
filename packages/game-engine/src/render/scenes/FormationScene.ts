import Phaser from "phaser";
import type { Formation, RosterHero } from "@battle-formation/shared-types";
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

  private timerText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;

  private onConfirmed?: (formation: Formation) => void;
  private confirmed = false;

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

    this.cameras.main.setBackgroundColor("#0f172a");
    this.grid = new GridManager({
      viewportWidth: this.scale.width,
      viewportHeight: this.scale.height,
    });
    this.drawGridSlots();

    this.timerText = this.add
      .text(this.scale.width / 2, 20, "", { fontSize: "18px", color: "#f59e0b" })
      .setOrigin(0.5, 0);
    this.statusText = this.add
      .text(this.scale.width / 2, 46, "Waiting for heroes...", {
        fontSize: "12px",
        color: "#94a3b8",
      })
      .setOrigin(0.5, 0);

    this.add
      .text(this.scale.width / 2, this.scale.height - 24, "[ Confirm Formation ]", {
        fontSize: "14px",
        color: "#22c55e",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.confirm());
  }

  private drawGridSlots(): void {
    if (!this.grid) return;
    const size = this.grid.getCellSize() - 4;
    for (const side of ["playerA", "playerB"] as const) {
      for (const slot of allSlots()) {
        const { x, y } = this.grid.getSlotPosition(side, slot);
        this.add
          .rectangle(x, y, size, size, side === "playerA" ? 0x1e293b : 0x312e1e)
          .setStrokeStyle(1, 0x475569);
      }
    }
  }

  /** Called by PhaserGame once RN sends LOAD_HEROES + START_FORMATION_PHASE. */
  startPreparation(
    roster: RosterHero[],
    durationSeconds: number,
    onConfirmed: (formation: Formation) => void
  ): void {
    if (!this.grid) return;

    this.confirmed = false;
    this.onConfirmed = onConfirmed;
    this.position = new PositionManager("playerA");
    this.placement = new HeroPlacement(this, this.grid, this.position, "playerA", () =>
      this.refreshStatus()
    );
    this.placement.loadRoster(roster, this.scale.height - 60);
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
    this.statusText?.setText(`${placed} / 6 heroes placed`);
  }

  private confirm(): void {
    if (this.confirmed || !this.position || !this.onConfirmed) return;

    const formation = this.position.toFormation();
    const result = validateFormation(formation);
    if (!result.valid) {
      this.statusText?.setText(result.errors[0] ?? "Formation incomplete");
      return;
    }

    this.confirmed = true;
    this.timer.stop();
    const hint = result.warnings[0] ? ` (${result.warnings[0]})` : "";
    this.statusText?.setText(`Formation locked in - waiting for opponent...${hint}`);
    this.onConfirmed(formation);
  }
}
