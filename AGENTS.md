# Micropad Agent Notes

This file is durable working context for coding agents in this repository. Use it for project conventions, architecture direction, and verification expectations. Use `TASKS.md` for the evolving task checklist.

This repo uses a lightweight Spec Kit-compatible structure in `.specify/`:

- `.specify/memory/constitution.md` contains project principles that every larger spec should satisfy.
- `.specify/specs/001-platform-foundation/` contains the first durable product/platform spec, plan, and task breakdown.
- `TASKS.md` remains the human-readable cross-feature migration board.

The official Spec Kit CLI was not run during initial setup because `uvx` and `CODEX_HOME` were not available in the local environment. To install official Codex skills later, use:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --integration codex
```

After running the official initializer, preserve the project-specific content in `AGENTS.md`, `TASKS.md`, and `.specify/memory/constitution.md`.

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
- `apps/server`: Electron-owned bridge/server.
- `widgets`: shared widget model/view-model package.
- `packages/protocol`: shared Zod schemas and socket event names for layouts, device profiles, widget events, and app snapshots.

The project currently uses Socket.IO. The protocol package should remain transport-agnostic where practical.

## Durable Decisions

- Browser-facing PWA functionality needs a secure context. Plain HTTP from phone to desktop is not enough for the consumer path.
- Preferred consumer HTTPS path is a real public domain/subdomain with a free DV certificate, probably Let's Encrypt.
- Advanced/offline-only HTTPS can use a local CA/self-signed certificate path, but that is not the default onboarding experience.
- mDNS/DNS-SD is useful for local discovery, but QR/manual pairing must remain available because browser PWAs cannot generally browse DNS-SD directly.
- Persisted layouts should use Micropad domain schemas, not raw UI-library objects such as `react-grid-layout` items.

## Working Rules

- Keep changes scoped and incremental.
- For major features, write or update a `.specify/specs/<NNN-feature>/` spec before implementation.
- Use the Spec Kit order for larger work: specify, clarify if needed, plan, tasks, implement.
- Prefer shared schemas in `packages/protocol` for persisted data and socket payloads.
- Keep `apps/server` as the authority for saved layouts and privileged actions.
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
