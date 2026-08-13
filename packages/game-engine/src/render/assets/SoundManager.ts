import type Phaser from "phaser";

type SynthKind = "attack" | "ability" | "death" | "victory" | "defeat" | "tap" | "music";

/**
 * Plays real audio files when wired in AssetManifest; otherwise falls back
 * to short Web Audio beeps so battles never feel silent in demos.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private musicStarted = false;

  constructor(private readonly scene: Phaser.Scene) {}

  play(key: string): void {
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: key.startsWith("music.") ? 0.35 : 0.7 });
      return;
    }
    this.playSynth(this.kindForKey(key));
  }

  private kindForKey(key: string): SynthKind {
    if (key.includes("ability")) return "ability";
    if (key.includes("death")) return "death";
    if (key.includes("victory")) return "victory";
    if (key.includes("defeat")) return "defeat";
    if (key.includes("ui") || key.includes("tap")) return "tap";
    if (key.includes("music")) return "music";
    return "attack";
  }

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private playSynth(kind: SynthKind): void {
    const ctx = this.getCtx();
    if (!ctx) return;

    if (kind === "music") {
      if (this.musicStarted) return;
      this.musicStarted = true;
      this.drone(ctx, 110, 0.04, 1.2);
      this.drone(ctx, 165, 0.03, 1.2);
      return;
    }

    const now = ctx.currentTime;
    switch (kind) {
      case "attack":
        this.blip(ctx, 420, 0.05, 0.09, "square");
        this.blip(ctx, 180, 0.04, 0.06, "triangle", now + 0.02);
        break;
      case "ability":
        this.blip(ctx, 520, 0.06, 0.12, "sawtooth");
        this.blip(ctx, 780, 0.05, 0.1, "sine", now + 0.05);
        break;
      case "death":
        this.blip(ctx, 220, 0.08, 0.18, "sawtooth");
        this.blip(ctx, 90, 0.06, 0.22, "triangle", now + 0.04);
        break;
      case "victory":
        this.blip(ctx, 523, 0.07, 0.12, "sine");
        this.blip(ctx, 659, 0.07, 0.12, "sine", now + 0.1);
        this.blip(ctx, 784, 0.08, 0.18, "sine", now + 0.2);
        break;
      case "defeat":
        this.blip(ctx, 300, 0.08, 0.16, "triangle");
        this.blip(ctx, 200, 0.08, 0.22, "triangle", now + 0.12);
        break;
      case "tap":
        this.blip(ctx, 660, 0.03, 0.04, "square");
        break;
    }
  }

  private blip(
    ctx: AudioContext,
    freq: number,
    gain: number,
    duration: number,
    type: OscillatorType,
    when = ctx.currentTime
  ): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + duration + 0.02);
  }

  private drone(ctx: AudioContext, freq: number, gain: number, duration: number): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}
