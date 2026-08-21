# Ability/effect sprites

One entry per `SkillKind` (`packages/shared-types` — `damage`, `heal`, `shield`, `buff`, `freeze`, `slow`), not per ability. Every ability's mechanical effect is already one of these six kinds (see `SkillManager`), so its visual can be too — a specific ability that needs a bespoke look (e.g. Fireball vs. a generic damage burst) is a per-hero-id override in `AssetManifest.ts`, the same escalation path `BehaviorRegistry` uses for AI.

```
effects/
  damage.png
  heal.png
  shield.png
  buff.png
  freeze.png
  slow.png
```

A short (4-8 frame) sprite sheet per effect reads best for a burst/impact animation; a single static frame is a fine placeholder step in between.
