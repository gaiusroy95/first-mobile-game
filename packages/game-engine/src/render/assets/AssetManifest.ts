import type { HeroClass, SkillKind } from "@battle-formation/shared-types";
import portraitCmdArab from "./portraits/cmd-arab.png";
import portraitCmdByzantine from "./portraits/cmd-byzantine.png";
import portraitCmdJanissary from "./portraits/cmd-janissary.png";
import portraitCmdMongol from "./portraits/cmd-mongol.png";
import portraitCmdSamurai from "./portraits/cmd-samurai.png";
import portraitCmdViking from "./portraits/cmd-viking.png";
import portraitUnitArabBlademaster from "./portraits/unit-arab-blademaster.png";
import portraitUnitArabMystic from "./portraits/unit-arab-mystic.png";
import portraitUnitArabVanguard from "./portraits/unit-arab-vanguard.png";
import portraitUnitByzantineGuard from "./portraits/unit-byzantine-guard.png";
import portraitUnitByzantineLancer from "./portraits/unit-byzantine-lancer.png";
import portraitUnitByzantineStrategos from "./portraits/unit-byzantine-strategos.png";
import portraitUnitJanissaryGuard from "./portraits/unit-janissary-guard.png";
import portraitUnitJanissaryMusketeer from "./portraits/unit-janissary-musketeer.png";
import portraitUnitJanissaryOfficer from "./portraits/unit-janissary-officer.png";
import portraitUnitMongolHorseArcher from "./portraits/unit-mongol-horse-archer.png";
import portraitUnitMongolRaider from "./portraits/unit-mongol-raider.png";
import portraitUnitMongolScout from "./portraits/unit-mongol-scout.png";
import portraitUnitSamuraiArcher from "./portraits/unit-samurai-archer.png";
import portraitUnitSamuraiKatana from "./portraits/unit-samurai-katana.png";
import portraitUnitSamuraiYari from "./portraits/unit-samurai-yari.png";
import portraitUnitVikingBerserker from "./portraits/unit-viking-berserker.png";
import portraitUnitVikingShaman from "./portraits/unit-viking-shaman.png";
import portraitUnitVikingShield from "./portraits/unit-viking-shield.png";

export type AssetCategory = "hero" | "effect" | "ui";

export interface SpriteAssetEntry {
  key: string;
  category: AssetCategory;
  /** Where the real file goes once art lands - see assets/<category>/ in the package root. Documents the expected path; not read at runtime until a real `source` is wired in below. */
  path: string;
  /** Solid-fill color (Phaser hex, 0xRRGGBB) used by PlaceholderFactory until `source` is set. */
  placeholderColor: number;
  /**
   * Resolved URL of a real image, once one exists - set this by adding a
   * static `import` at the top of this file (Vite inlines it as base64,
   * consistent with how the whole Phaser bundle already ships as one
   * self-contained HTML string) and assigning it here. AssetLoader prefers
   * this over the placeholder the instant it's non-undefined; no other
   * file needs to change.
   */
  source?: string;
  /** Set once `source` is a real sprite sheet - frame layout AnimationRegistry needs to define clips. */
  frames?: { width: number; height: number; count: number };
}

export interface AudioAssetEntry {
  key: string;
  category: "sfx" | "music";
  path: string;
  /** Same convention as SpriteAssetEntry.source - undefined until a real file is wired in. */
  source?: string;
}

/**
 * One entry per hero CLASS (7 total), not per individual hero - the same
 * "class defines the default, a hero id can override it" shape as
 * BehaviorRegistry (simulation/battle/ai/BehaviorRegistry.ts). Two heroes
 * of the same class share a sprite until one specifically needs its own;
 * that's a `heroOverrides` entry to add later, not a reason to key this by
 * hero id today.
 */
export const HERO_SPRITES: Record<HeroClass, SpriteAssetEntry> = {
  commander: {
    key: "hero.commander",
    category: "hero",
    path: "assets/heroes/commander/idle.png",
    placeholderColor: 0xeab308,
  },
  tank: { key: "hero.tank", category: "hero", path: "assets/heroes/tank/idle.png", placeholderColor: 0x64748b },
  knight: { key: "hero.knight", category: "hero", path: "assets/heroes/knight/idle.png", placeholderColor: 0x94a3b8 },
  archer: { key: "hero.archer", category: "hero", path: "assets/heroes/archer/idle.png", placeholderColor: 0x22c55e },
  "fire-mage": {
    key: "hero.fire-mage",
    category: "hero",
    path: "assets/heroes/fire-mage/idle.png",
    placeholderColor: 0xf97316,
  },
  "ice-mage": {
    key: "hero.ice-mage",
    category: "hero",
    path: "assets/heroes/ice-mage/idle.png",
    placeholderColor: 0x38bdf8,
  },
  assassin: {
    key: "hero.assassin",
    category: "hero",
    path: "assets/heroes/assassin/idle.png",
    placeholderColor: 0x7c3aed,
  },
  healer: { key: "hero.healer", category: "hero", path: "assets/heroes/healer/idle.png", placeholderColor: 0xfacc15 },
};

/**
 * One entry per hero id that has real illustrated art (cropped from
 * apps/mobile/assets/factions/, the same source FIGHTER_PORTRAITS in the
 * mobile app's portraits.ts uses) - a heroId here always overrides the
 * HERO_SPRITES class placeholder for that specific hero. Any hero id not
 * listed (locked/future factions) simply falls through to its class
 * placeholder, same as every hero did before this map existed.
 */
export const HERO_PORTRAITS: Record<string, SpriteAssetEntry> = {
  "cmd-arab": { key: "portrait.cmd-arab", category: "hero", path: "portraits/cmd-arab.png", placeholderColor: 0xeab308, source: portraitCmdArab },
  "cmd-byzantine": { key: "portrait.cmd-byzantine", category: "hero", path: "portraits/cmd-byzantine.png", placeholderColor: 0xeab308, source: portraitCmdByzantine },
  "cmd-janissary": { key: "portrait.cmd-janissary", category: "hero", path: "portraits/cmd-janissary.png", placeholderColor: 0xeab308, source: portraitCmdJanissary },
  "cmd-mongol": { key: "portrait.cmd-mongol", category: "hero", path: "portraits/cmd-mongol.png", placeholderColor: 0xeab308, source: portraitCmdMongol },
  "cmd-samurai": { key: "portrait.cmd-samurai", category: "hero", path: "portraits/cmd-samurai.png", placeholderColor: 0xeab308, source: portraitCmdSamurai },
  "cmd-viking": { key: "portrait.cmd-viking", category: "hero", path: "portraits/cmd-viking.png", placeholderColor: 0xeab308, source: portraitCmdViking },
  "unit-arab-blademaster": { key: "portrait.unit-arab-blademaster", category: "hero", path: "portraits/unit-arab-blademaster.png", placeholderColor: 0x7c3aed, source: portraitUnitArabBlademaster },
  "unit-arab-mystic": { key: "portrait.unit-arab-mystic", category: "hero", path: "portraits/unit-arab-mystic.png", placeholderColor: 0xfacc15, source: portraitUnitArabMystic },
  "unit-arab-vanguard": { key: "portrait.unit-arab-vanguard", category: "hero", path: "portraits/unit-arab-vanguard.png", placeholderColor: 0x64748b, source: portraitUnitArabVanguard },
  "unit-byzantine-guard": { key: "portrait.unit-byzantine-guard", category: "hero", path: "portraits/unit-byzantine-guard.png", placeholderColor: 0x64748b, source: portraitUnitByzantineGuard },
  "unit-byzantine-lancer": { key: "portrait.unit-byzantine-lancer", category: "hero", path: "portraits/unit-byzantine-lancer.png", placeholderColor: 0x94a3b8, source: portraitUnitByzantineLancer },
  "unit-byzantine-strategos": { key: "portrait.unit-byzantine-strategos", category: "hero", path: "portraits/unit-byzantine-strategos.png", placeholderColor: 0x94a3b8, source: portraitUnitByzantineStrategos },
  "unit-janissary-guard": { key: "portrait.unit-janissary-guard", category: "hero", path: "portraits/unit-janissary-guard.png", placeholderColor: 0x64748b, source: portraitUnitJanissaryGuard },
  "unit-janissary-musketeer": { key: "portrait.unit-janissary-musketeer", category: "hero", path: "portraits/unit-janissary-musketeer.png", placeholderColor: 0xf97316, source: portraitUnitJanissaryMusketeer },
  "unit-janissary-officer": { key: "portrait.unit-janissary-officer", category: "hero", path: "portraits/unit-janissary-officer.png", placeholderColor: 0x94a3b8, source: portraitUnitJanissaryOfficer },
  "unit-mongol-horse-archer": { key: "portrait.unit-mongol-horse-archer", category: "hero", path: "portraits/unit-mongol-horse-archer.png", placeholderColor: 0x22c55e, source: portraitUnitMongolHorseArcher },
  "unit-mongol-raider": { key: "portrait.unit-mongol-raider", category: "hero", path: "portraits/unit-mongol-raider.png", placeholderColor: 0x64748b, source: portraitUnitMongolRaider },
  "unit-mongol-scout": { key: "portrait.unit-mongol-scout", category: "hero", path: "portraits/unit-mongol-scout.png", placeholderColor: 0x7c3aed, source: portraitUnitMongolScout },
  "unit-samurai-archer": { key: "portrait.unit-samurai-archer", category: "hero", path: "portraits/unit-samurai-archer.png", placeholderColor: 0x22c55e, source: portraitUnitSamuraiArcher },
  "unit-samurai-katana": { key: "portrait.unit-samurai-katana", category: "hero", path: "portraits/unit-samurai-katana.png", placeholderColor: 0x94a3b8, source: portraitUnitSamuraiKatana },
  "unit-samurai-yari": { key: "portrait.unit-samurai-yari", category: "hero", path: "portraits/unit-samurai-yari.png", placeholderColor: 0x64748b, source: portraitUnitSamuraiYari },
  "unit-viking-berserker": { key: "portrait.unit-viking-berserker", category: "hero", path: "portraits/unit-viking-berserker.png", placeholderColor: 0x7c3aed, source: portraitUnitVikingBerserker },
  "unit-viking-shaman": { key: "portrait.unit-viking-shaman", category: "hero", path: "portraits/unit-viking-shaman.png", placeholderColor: 0xfacc15, source: portraitUnitVikingShaman },
  "unit-viking-shield": { key: "portrait.unit-viking-shield", category: "hero", path: "portraits/unit-viking-shield.png", placeholderColor: 0x64748b, source: portraitUnitVikingShield },
};

/** One entry per SkillKind (shared-types) - matches 1:1 with what SkillManager can actually cast, so every ability already has a visual by construction. */
export const EFFECT_SPRITES: Record<SkillKind, SpriteAssetEntry> = {
  damage: { key: "fx.damage", category: "effect", path: "assets/effects/damage.png", placeholderColor: 0xef4444 },
  heal: { key: "fx.heal", category: "effect", path: "assets/effects/heal.png", placeholderColor: 0x22c55e },
  shield: { key: "fx.shield", category: "effect", path: "assets/effects/shield.png", placeholderColor: 0x38bdf8 },
  buff: { key: "fx.buff", category: "effect", path: "assets/effects/buff.png", placeholderColor: 0xfacc15 },
  freeze: { key: "fx.freeze", category: "effect", path: "assets/effects/freeze.png", placeholderColor: 0x67e8f9 },
  slow: { key: "fx.slow", category: "effect", path: "assets/effects/slow.png", placeholderColor: 0xa78bfa },
};

export const UI_SPRITES: SpriteAssetEntry[] = [
  { key: "ui.button", category: "ui", path: "assets/ui/button.png", placeholderColor: 0x6366f1 },
  { key: "ui.panel", category: "ui", path: "assets/ui/panel.png", placeholderColor: 0x1e293b },
  { key: "ui.icon.gold", category: "ui", path: "assets/ui/icons/gold.png", placeholderColor: 0xf59e0b },
  { key: "ui.icon.trophy", category: "ui", path: "assets/ui/icons/trophy.png", placeholderColor: 0xfacc15 },
];

export const SOUNDS: AudioAssetEntry[] = [
  { key: "sfx.attack", category: "sfx", path: "assets/sounds/sfx/attack.mp3" },
  { key: "sfx.ability", category: "sfx", path: "assets/sounds/sfx/ability.mp3" },
  { key: "sfx.death", category: "sfx", path: "assets/sounds/sfx/death.mp3" },
  { key: "sfx.victory", category: "sfx", path: "assets/sounds/sfx/victory.mp3" },
  { key: "sfx.defeat", category: "sfx", path: "assets/sounds/sfx/defeat.mp3" },
  { key: "sfx.ui-tap", category: "sfx", path: "assets/sounds/sfx/ui-tap.mp3" },
  { key: "music.formation", category: "music", path: "assets/sounds/music/formation.mp3" },
  { key: "music.battle", category: "music", path: "assets/sounds/music/battle.mp3" },
];

export type AnimationClip = "idle" | "attack" | "cast" | "death";

/**
 * idle/attack/cast/death map directly onto the states a HeroEntity can be
 * in (see simulation/battle/ai/AIState.ts: IDLE, ATTACK, CAST_SKILL, DEAD)
 * - once BattleScene's sprite-animation pass exists (its own TODO, not
 * this pipeline), it can play `animationKey(hero.class, aiStateToClip(...))`
 * directly off live simulation state with no per-hero-class branching.
 */
export function animationKey(heroClass: HeroClass, clip: AnimationClip): string {
  return `${heroClass}.${clip}`;
}
