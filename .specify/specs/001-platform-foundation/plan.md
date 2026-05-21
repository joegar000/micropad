# Plan: Micropad Platform Foundation

## Constitution Check

- Local-first runtime authority: bridge owns layouts, pairing, plugins, and desktop actions.
- Secure mobile PWA: design explicit runtime modes and avoid self-signed CA as consumer default.
- Protocol-first boundaries: shared schemas live in `packages/protocol`.
- Device-aware layouts: pairing must produce durable device identity and layout assignment.
- Verifiable feature slices: each phase should build and, where applicable, lint.
- Plugin/action permissions: separate widgets from actions before expanding integrations.

## Current Baseline

- `apps/client` is a Vite React PWA/editor.
- `apps/server` is an Electron-owned bridge/server.
- `widgets` contains shared widget models/view-models.
- `packages/protocol` now contains layout, device, app snapshot, and widget event schemas.
- The bridge currently persists layouts to JSON as an interim step.

## Phase 1: Persistence And Layout Contracts

Replace bridge JSON persistence with SQLite and add migration support.

Design outputs:

- SQLite schema for layouts, pages, widget instances, devices, sessions, and assignments.
- Migration strategy from current JSON store and old client IndexedDB stores.
- Bridge layout API surface.

Verification:

- Protocol schema tests.
- Layout store tests.
- `npm run build`.

## Phase 2: Pairing And Device Identity

Add pairing tokens, device registration, device profiles, and layout assignment.

Design outputs:

- Pairing token lifecycle.
- Device/session model.
- QR URL format.
- Client handshake protocol.

Verification:

- Socket contract tests.
- Manual mobile pairing checklist.

## Phase 3: Secure Runtime Modes

Define and implement dev HTTP, public HTTPS, and local CA/offline runtime modes.

Design outputs:

- Runtime mode configuration.
- Certificate provisioning plan.
- Service worker/PWA validation plan.

Verification:

- PWA install/service worker checks on mobile.
- Offline-after-setup manual QA.

## Phase 4: Actions And Plugin Boundary

Separate widget definitions from action definitions and add the first privileged desktop actions.

Design outputs:

- Action schemas.
- Plugin manifest format.
- Permission model.
- Action execution API.

Verification:

- Unit tests for action routing and permission checks.
- Manual tests for media controls, app launch, hotkeys, and Discord.

## Phase 5: Editor Completeness

Add page management, widget config editing, sync status, and mobile viewport hardening.

Design outputs:

- Page management UX.
- Widget instance config model.
- Save/error state model.

Verification:

- Interaction tests for drag/drop/resize/delete.
- Mobile/tablet viewport QA.

## Risks

- HTTPS onboarding could become the hardest consumer experience if certificate provisioning is not designed early.
- Schema churn could strand early layouts unless migrations are treated as first-class work.
- Dynamic plugin execution needs permission boundaries before third-party plugin support.
- Next.js migration could distract from protocol/runtime work if done too early.

