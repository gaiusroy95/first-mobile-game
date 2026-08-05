# Hero sprites

One subfolder per `HeroClass` id (matches `packages/shared-types/src/domain/hero.ts`), not per individual hero — two heroes of the same class share art until a specific hero earns its own (see `AssetManifest.ts` for how to override one).

```
heroes/
  tank/
    idle.png        (or idle.png + idle.json if exported as a sprite sheet + atlas)
    attack.png
    cast.png
    death.png
  knight/
  archer/
  fire-mage/
  ice-mage/
  assassin/
  healer/
```

**Format:** sprite sheet (PNG) + frame atlas (JSON, TexturePacker "Hash" or "Array" format) per clip. A single idle-only PNG with no atlas also works — `AssetManifest.ts`'s `frames` field is optional; omit it and the sprite renders static.

**Size:** keep sheets modest (≤512×512 per clip) while assets are still embedded as base64 inside the single-file HTML bundle (see the root explanation for why). Once real art is large enough to matter, that's the trigger to move to runtime `fetch()`-loaded assets instead — not before.

**Wiring a new file in:** add a static `import` of it at the top of `AssetManifest.ts` and pass the resolved URL into that hero class's `HERO_SPRITES` entry. `AssetLoader.ts` already prefers a real source over the placeholder the moment one is present — nothing else changes.
