import type Phaser from "phaser";

const PLACEHOLDER_SIZE = 56;

export type PlaceholderShape =
  | "circle"
  | "shield"
  | "diamond"
  | "triangle"
  | "hex"
  | "star"
  | "square"
  | "cross";

/**
 * Bakes a readable class silhouette into the texture cache. Real art from
 * AssetManifest.source replaces these automatically when wired.
 */
export function ensurePlaceholderTexture(
  scene: Phaser.Scene,
  key: string,
  color: number,
  shape: PlaceholderShape = "circle"
): void {
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();
  const cx = PLACEHOLDER_SIZE / 2;
  const cy = PLACEHOLDER_SIZE / 2;
  const r = PLACEHOLDER_SIZE / 2 - 3;

  graphics.lineStyle(2, 0xf8fafc, 0.9);
  graphics.fillStyle(color, 1);

  switch (shape) {
    case "shield":
      graphics.fillRoundedRect(cx - r * 0.7, cy - r, r * 1.4, r * 1.7, 6);
      graphics.strokeRoundedRect(cx - r * 0.7, cy - r, r * 1.4, r * 1.7, 6);
      break;
    case "diamond":
      graphics.fillPoints(
        [
          { x: cx, y: cy - r },
          { x: cx + r, y: cy },
          { x: cx, y: cy + r },
          { x: cx - r, y: cy },
        ],
        true
      );
      graphics.strokePoints(
        [
          { x: cx, y: cy - r },
          { x: cx + r, y: cy },
          { x: cx, y: cy + r },
          { x: cx - r, y: cy },
        ],
        true
      );
      break;
    case "triangle":
      graphics.fillTriangle(cx, cy - r, cx + r, cy + r * 0.8, cx - r, cy + r * 0.8);
      graphics.lineStyle(2, 0xf8fafc, 0.9);
      graphics.strokeTriangle(cx, cy - r, cx + r, cy + r * 0.8, cx - r, cy + r * 0.8);
      break;
    case "hex": {
      const pts = hexPoints(cx, cy, r);
      graphics.fillPoints(pts, true);
      graphics.strokePoints(pts, true);
      break;
    }
    case "star": {
      const pts = starPoints(cx, cy, r, r * 0.45, 5);
      graphics.fillPoints(pts, true);
      graphics.strokePoints(pts, true);
      break;
    }
    case "square":
      graphics.fillRoundedRect(cx - r * 0.75, cy - r * 0.75, r * 1.5, r * 1.5, 4);
      graphics.strokeRoundedRect(cx - r * 0.75, cy - r * 0.75, r * 1.5, r * 1.5, 4);
      break;
    case "cross":
      graphics.fillCircle(cx, cy, r);
      graphics.lineStyle(4, 0xf8fafc, 0.95);
      graphics.lineBetween(cx - r * 0.5, cy, cx + r * 0.5, cy);
      graphics.lineBetween(cx, cy - r * 0.5, cx, cy + r * 0.5);
      break;
    default:
      graphics.fillCircle(cx, cy, r);
      graphics.strokeCircle(cx, cy, r);
      break;
  }

  graphics.generateTexture(key, PLACEHOLDER_SIZE, PLACEHOLDER_SIZE);
  graphics.destroy();
}

function hexPoints(cx: number, cy: number, r: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

function starPoints(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  spikes: number
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
  }
  return pts;
}

export function shapeForHeroKey(key: string): PlaceholderShape {
  if (key.includes("commander")) return "star";
  if (key.includes("tank")) return "shield";
  if (key.includes("knight")) return "square";
  if (key.includes("archer")) return "triangle";
  if (key.includes("fire-mage")) return "diamond";
  if (key.includes("ice-mage")) return "hex";
  if (key.includes("assassin")) return "diamond";
  if (key.includes("healer")) return "cross";
  return "circle";
}
