import type Phaser from "phaser";

/**
 * Thin wrapper so call sites never have to check "has this sound been
 * wired in yet" themselves. `sound.play("sfx.attack")` is correct to
 * write today, while every SOUNDS entry in AssetManifest.ts is still
 * source-less - it's a silent no-op until a real file lands, then starts
 * playing with no change at the call site.
 */
export class SoundManager {
  constructor(private readonly scene: Phaser.Scene) {}

  play(key: string): void {
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key);
  }
}
