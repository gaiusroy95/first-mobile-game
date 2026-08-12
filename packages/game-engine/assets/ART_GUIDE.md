# Art drop-in guide (AssetManifest)

Gameplay never hardcodes PNG paths. Wire artist assets through
`packages/game-engine/src/render/assets/AssetManifest.ts`:

1. Place files under `packages/game-engine/assets/<heroes|effects|ui|sounds>/...`
2. `import` the file at the top of `AssetManifest.ts` (Vite inlines it).
3. Set `source` on the matching `SpriteAssetEntry` / `AudioAssetEntry`.
4. For sheets, set `frames: { width, height, count }` and ensure
   `AnimationRegistry` clip names stay `idle` / `attack` / `cast` / `death`.

## Recommended frame sizes

| Category | Frame | Notes |
|---|---|---|
| Hero idle/attack/cast/death | 96×96 | Centered feet; readable at 48–64px on mobile |
| Skill VFX | 128×128 | Transparent background |
| UI icons | 64×64 | Gold / trophy / buttons |
| SFX | ogg/mp3 | Keys in `SOUNDS` (attack, ability, death, victory, music_battle) |

Until `source` is set, class-colored silhouettes from `PlaceholderFactory`
keep battles readable (Clash Mini clarity bar).

## Cosmetics

Cosmetic skins are inventory ids (e.g. `skin_gold_trim`). They must not
change combat stats — visual tint/overlay only when art lands.
