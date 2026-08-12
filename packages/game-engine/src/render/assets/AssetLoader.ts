import type Phaser from "phaser";
import { EFFECT_SPRITES, HERO_SPRITES, SOUNDS, UI_SPRITES, type SpriteAssetEntry } from "./AssetManifest";
import { ensurePlaceholderTexture, shapeForHeroKey } from "./PlaceholderFactory";

/**
 * Call from a scene's `preload()`. Only entries with a real `source`
 * wired in (see AssetManifest.ts) do anything here - Phaser only
 * auto-processes `scene.load.*` calls queued during `preload()`, so this
 * has to run there, not `create()`, or a real asset added later would
 * silently never load. Today every entry is placeholder-only, so this is
 * a no-op in practice - it exists now so that adding real art later is
 * "wire the source" only, not "also relearn Phaser's load lifecycle."
 */
export function preloadAssets(scene: Phaser.Scene): void {
  for (const entry of Object.values(HERO_SPRITES)) preloadSprite(scene, entry);
  for (const entry of Object.values(EFFECT_SPRITES)) preloadSprite(scene, entry);
  for (const entry of UI_SPRITES) preloadSprite(scene, entry);

  for (const entry of SOUNDS) {
    // No placeholder concept for audio (see assets/sounds/README.md) -
    // simply not loaded until a real file is wired in. SoundManager checks
    // cache presence before playing, so this is a silent no-op rather than
    // a runtime error.
    if (entry.source) {
      scene.load.audio(entry.key, entry.source);
    }
  }
}

function preloadSprite(scene: Phaser.Scene, entry: SpriteAssetEntry): void {
  if (!entry.source) return;

  if (entry.frames) {
    scene.load.spritesheet(entry.key, entry.source, {
      frameWidth: entry.frames.width,
      frameHeight: entry.frames.height,
    });
  } else {
    scene.load.image(entry.key, entry.source);
  }
}

/**
 * Call from `create()`, after `preloadAssets`'s queued loads (if any) have
 * finished - fills in a placeholder texture for every sprite entry that
 * still doesn't have a real one loaded. Synchronous (Graphics ->
 * generateTexture), so it doesn't need Phaser's load queue at all.
 */
export function generatePlaceholders(scene: Phaser.Scene): void {
  for (const entry of Object.values(HERO_SPRITES)) generateIfMissing(scene, entry);
  for (const entry of Object.values(EFFECT_SPRITES)) generateIfMissing(scene, entry);
  for (const entry of UI_SPRITES) generateIfMissing(scene, entry);
}

function generateIfMissing(scene: Phaser.Scene, entry: SpriteAssetEntry): void {
  if (scene.textures.exists(entry.key)) return; // real asset loaded successfully
  const shape = entry.category === "hero" ? shapeForHeroKey(entry.key) : "circle";
  ensurePlaceholderTexture(scene, entry.key, entry.placeholderColor, shape);
}
