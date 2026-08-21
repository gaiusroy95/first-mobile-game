export {
  HERO_SPRITES,
  EFFECT_SPRITES,
  UI_SPRITES,
  SOUNDS,
  animationKey,
  type AssetCategory,
  type SpriteAssetEntry,
  type AudioAssetEntry,
  type AnimationClip,
} from "./AssetManifest";
export { ensurePlaceholderTexture, shapeForHeroKey, type PlaceholderShape } from "./PlaceholderFactory";
export { preloadAssets, generatePlaceholders } from "./AssetLoader";
export { createHeroAnimations } from "./AnimationRegistry";
export { SoundManager } from "./SoundManager";
