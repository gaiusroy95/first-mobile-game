# Battle Formation — Local Dev Runbook

## Prerequisites

- Node.js 20+
- Postgres (local or Docker)
- Redis (local or Docker)

## Environment

Backend (`apps/backend/.env`):

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/battle_formation
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-at-least-16-chars
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

Mobile (`apps/mobile` or shell env):

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

On a physical device, use your machine LAN IP instead of `localhost`.

## Boot

```bash
# install + build shared packages / Phaser bundle
npm install

# terminal 1 — API + sockets
npm run dev --workspace=@battle-formation/backend

# terminal 2 — Expo (two clients for real PvP)
npm run web
# and/or: npm run android / npm run ios
```

## Online PvP smoke test

1. Register two accounts (Login → Register).
2. Both open Lobby → Find Match (or Modes → Casual/Ranked).
3. Each places 6 heroes within 20s and confirms.
4. Both watch the same animated battle, then Victory with gold/XP/trophies/cards.

## Rebuild Phaser bundle after engine changes

```bash
npm run build:game
```

## EAS preview

`apps/mobile/eas.json` preview profile points at the Render staging API. Production builds should set the same `EXPO_PUBLIC_*` vars for the live backend.
