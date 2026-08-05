# Audio

```
sounds/
  sfx/       one-shot effects: attack, ability cast, death, victory, defeat, UI tap
  music/     looping background tracks: formation-phase, battle
```

**Format:** MP3 (or OGG — Phaser/browsers handle both; MP3 has the broadest WebView compatibility). Keep `sfx/` clips short (under ~1s) since, like images, they're currently inlined as base64 into the single-file bundle.

Unlike sprites, there is no procedural placeholder for sound — `AssetLoader.ts` just doesn't load a key with no file behind it yet, and anything that tries to play it is a silent no-op (see `SoundManager` — checked, never assumed present). Drop a file in and wire its import in `AssetManifest.ts`'s `SOUNDS` list; nothing else needs to change for it to start playing.
