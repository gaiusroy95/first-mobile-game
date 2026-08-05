import type Phaser from "phaser";
import type { HeroClass } from "@battle-formation/shared-types";
import { HERO_SPRITES, animationKey, type AnimationClip } from "./AssetManifest";

const CLIPS: AnimationClip[] = ["idle", "attack", "cast", "death"];
const FRAME_RATE_BY_CLIP: Record<AnimationClip, number> = { idle: 6, attack: 12, cast: 10, death: 8 };
const LOOPING_CLIPS: ReadonlySet<AnimationClip> = new Set(["idle"]);

/**
 * Creates Phaser frame-based animations from each hero sprite's `frames`
 * data. Only runs for classes whose HERO_SPRITES entry actually has
 * `frames` set - i.e. a real multi-frame sprite sheet has been wired in.
 * Placeholders are single-frame textures, so there is nothing to animate
 * yet; this deliberately does not fake motion from one frame. Interim
 * visual feedback on placeholders (attack flash, hit shake) is a plain
 * Phaser Tween on the sprite instead, which needs no frame data at all -
 * see BattleScene's sprite-animation TODO for where that belongs.
 */
export function createHeroAnimations(scene: Phaser.Scene): void {
  for (const [heroClass, sprite] of Object.entries(HERO_SPRITES) as [HeroClass, (typeof HERO_SPRITES)[HeroClass]][]) {
    if (!sprite.frames) continue;

    for (const clip of CLIPS) {
      const key = animationKey(heroClass, clip);
      if (scene.anims.exists(key)) continue;

      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(sprite.key, { start: 0, end: sprite.frames.count - 1 }),
        frameRate: FRAME_RATE_BY_CLIP[clip],
        repeat: LOOPING_CLIPS.has(clip) ? -1 : 0,
      });
    }
  }
}
