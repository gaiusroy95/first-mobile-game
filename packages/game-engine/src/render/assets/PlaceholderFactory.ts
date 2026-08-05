import type Phaser from "phaser";

const PLACEHOLDER_SIZE = 48;

/**
 * Bakes a solid-color circle into the texture cache under `key`, standing
 * in for real art until some exists. Idempotent and cheap: Phaser's
 * texture cache is game-global (not per-scene), so calling this again for
 * a key that's already generated - from another scene, or a scene restart
 * - is a no-op check, not a redraw.
 */
export function ensurePlaceholderTexture(scene: Phaser.Scene, key: string, color: number): void {
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillCircle(PLACEHOLDER_SIZE / 2, PLACEHOLDER_SIZE / 2, PLACEHOLDER_SIZE / 2);
  graphics.generateTexture(key, PLACEHOLDER_SIZE, PLACEHOLDER_SIZE);
  graphics.destroy();
}
