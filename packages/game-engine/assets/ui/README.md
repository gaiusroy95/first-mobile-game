# UI assets (in-battlefield only)

Buttons/panels/icons drawn *inside the Phaser canvas* — the formation grid, the confirm button, the prep timer chrome. This is **not** where the React Native app's UI assets go; those are a separate concern owned by `apps/mobile` (its screens are native RN views, not Phaser), and should live under `apps/mobile/assets/` with their own manifest if/when that app needs custom icons beyond emoji/RN built-ins.

```
ui/
  button.png
  panel.png
  icons/
    gold.png
    trophy.png
```
