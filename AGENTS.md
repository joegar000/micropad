# Micropad Agent Notes

This file is durable working context for coding agents in this repository. Use it for project conventions, architecture direction, and verification expectations. Use `TASKS.md` for the evolving task checklist.

## Product Direction

Micropad is a local-first Stream Deck alternative.

- The desktop app owns the local runtime bridge/server.
- Phones and tablets connect over the same Wi-Fi.
- The bridge serves the PWA, pairs clients, stores layouts, hosts plugins/themes, receives widget events, and executes privileged desktop actions.
- Layouts are per device by default, but saved layouts live on the desktop/bridge and can be reused by clients.
- Editing mode supports pages, drag/drop, resize, and square grid cells.
- Widgets may span multiple square cells such as 1x1, 2x1, and 2x2.
- First actions are media controls, app launch, hotkeys, and Discord integration.
- The desktop app should work offline after setup.

## Current Architecture

- `apps/client`: Vite React client/PWA/editor.
- `apps/desktop`: Electron-owned desktop app and embedded bridge runtime.
- `widgets`: shared widget model/view-model package.
- `packages/protocol`: shared Zod schemas and socket event names for layouts, device profiles, widget events, and app snapshots.

Important source folders:

- `apps/desktop/src/bridge`: socket/app snapshot handlers.
- `apps/desktop/src/desktop`: Electron window/UI helpers.
- `apps/desktop/src/network`: local address and platform helpers.
- `apps/desktop/src/storage`: bridge-owned persistence.
- `apps/client/src/lib`: non-React client helpers.
- `apps/client/src/store`: client stores and layout adapters.

The project currently uses Socket.IO. The protocol package should remain transport-agnostic where practical.

## Durable Decisions

- Browser-facing PWA functionality needs a secure context. Plain HTTP from phone to desktop is not enough for the consumer path.
- Preferred consumer HTTPS path is a real public domain/subdomain with a free DV certificate, probably Let's Encrypt.
- Advanced/offline-only HTTPS can use a local CA/self-signed certificate path, but that is not the default onboarding experience.
- mDNS/DNS-SD is useful for local discovery, but QR/manual pairing must remain available because browser PWAs cannot generally browse DNS-SD directly.
- Persisted layouts should use Micropad domain schemas, not raw UI-library objects such as `react-grid-layout` items.

## Working Rules

- Keep changes scoped and incremental.
- Prefer shared schemas in `packages/protocol` for persisted data and socket payloads.
- Keep the bridge code under `apps/desktop` as the authority for saved layouts and privileged actions until it is intentionally extracted.
- Keep client IndexedDB as cache/local UI state, not the canonical store.
- Avoid adding a new abstraction unless it removes real complexity or matches an existing local pattern.
- Do not commit secrets, generated local data, or user-specific runtime state.
- Update `TASKS.md` when completing or adding migration work.

## Verification

Run these before handing off meaningful code changes:

```bash
npm run build
npm run lint --workspace=apps/client
```

Known limitation: `npm run lint --workspace=widgets` currently has no workspace ESLint config. The widget package should still build through `npm run build`.
