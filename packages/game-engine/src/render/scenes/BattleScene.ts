import Phaser from "phaser";
import type { BattleEvent, Formation, HeroDefinition } from "@battle-formation/shared-types";

/**
 * Renders whatever GameManager tells it to. This scene has no knowledge of
 * the bridge, simulation, or rewards - it only knows how to draw hero
 * catalog/formation state and play back an event log. Text-log rendering
 * is a placeholder; swapping it for sprite movement/attack animation later
 * only touches this file, not PhaserGame or GameManager.
 */
export class BattleScene extends Phaser.Scene {
  private statusText?: Phaser.GameObjects.Text;
  private logText?: Phaser.GameObjects.Text;
  private heroCatalog: HeroDefinition[] = [];

  // `scene.start()` queues the scene boot for the next game step rather
  // than running create() synchronously, so a caller that starts this scene
  // and immediately calls playEvents() can race create(). Buffering here
  // (flushed at the end of create()) makes playEvents safe to call at any
  // time regardless of that timing, the same way GameContainer buffers
  // bridge messages sent before GAME_READY.
  private pendingPlayback?: { events: BattleEvent[]; onComplete: () => void };

  constructor() {
    super("Battle");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111827");
    this.add
      .text(20, 20, "Battle Formation", { fontSize: "20px", color: "#ffffff" })
      .setOrigin(0, 0);
    this.statusText = this.add
      .text(20, 50, "Waiting for heroes...", { fontSize: "14px", color: "#9ca3af" })
      .setOrigin(0, 0);
    this.logText = this.add
      .text(20, 80, "", { fontSize: "12px", color: "#6b7280" })
      .setOrigin(0, 0);

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
    this.statusText?.setText(`${this.heroCatalog.length} heroes loaded. Waiting for formation...`);
  }

  setFormation(formations: [Formation, Formation]): void {
    const total = formations[0].slots.length + formations[1].slots.length;
    this.statusText?.setText(`Formation set: ${total} heroes placed. Ready to battle.`);
  }

  /** Plays an event log and invokes onComplete once playback finishes. */
  playEvents(events: BattleEvent[], onComplete: () => void): void {
    if (!this.statusText || !this.logText) {
      this.pendingPlayback = { events, onComplete };
      return;
    }

    this.statusText.setText("Battle in progress...");
    this.logText.setText(events.map((event) => JSON.stringify(event)));

    // TODO(Phase 2): drive sprite tweens per event, timed by `tick`, and
    // call onComplete when the last tween finishes instead of immediately.
    onComplete();
  }
}
