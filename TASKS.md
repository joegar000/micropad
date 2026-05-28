# Micropad Migration Tasks

Last updated: 2026-05-28

This file tracks the work needed to evolve Micropad into the local-first desktop bridge plus mobile PWA architecture. Keep it current as tasks move between phases.

## Done

- [x] Add shared `micropad-protocol` workspace with versioned layout, page, widget instance, device profile, app snapshot, and socket event schemas.
- [x] Refactor the client layout store toward Micropad domain layout data instead of raw `react-grid-layout` persistence.
- [x] Add bridge-owned file layout persistence as an interim step before SQLite.
- [x] Add `app:snapshot`, `layout:update`, `layout:saved`, and `widget:event` protocol events while keeping legacy widget event compatibility.
- [x] Add basic mDNS/DNS-SD service publishing for the bridge.
- [x] Make `npm run build` cover protocol, widgets, client, and desktop bridge.
- [x] Refactor source organization: bridge/desktop/network/storage folders, client lib/store/hook filenames, and split protocol schema modules.
- [x] Rename top-level `apps/server` workspace to `apps/desktop` and decide to defer a separate bridge package until persistence/pairing boundaries stabilize.
- [x] Add basic unit tests for protocol schemas/helpers and file-backed bridge layout storage.
- [x] Make desktop QR/runtime URLs use the advertised `.local` mDNS host with a LAN IP fallback.

## Next

- [ ] Replace bridge JSON layout persistence with SQLite and migration support.
- [ ] Extract bridge runtime into a separate package/workspace after SQLite persistence and pairing models stabilize.
- [ ] Add a pairing model with short-lived tokens, device identity, client/session identity, and layout assignment.
- [ ] Remove wildcard CORS once pairing/auth exists.
- [ ] Capture device profiles from clients: screen size, DPR, orientation, device label, and device kind.
- [ ] Add explicit layout APIs for list, create, duplicate, assign to device, update page, and update widget instance.
- [ ] Add server-to-client sync acknowledgements and error handling for layout saves.
- [ ] Add migration logic from old client IndexedDB layout stores to the new layout schema.

## Client And Editor

- [ ] Add page management UI: create, rename, reorder, delete, and switch pages.
- [ ] Add page navigation widgets or gestures for runtime mode.
- [ ] Enforce grid bounds when rows/columns are reduced.
- [ ] Add widget instance config editing and persist config through the new layout model.
- [ ] Show connection state, save state, and bridge errors in the editor.
- [ ] Add mobile/tablet viewport QA for square grid sizing, drag/drop, and resizing.
- [ ] Decide timing and migration plan for moving from Vite to Next.js.

## Actions, Widgets, And Plugins

- [ ] Separate widget definitions from desktop actions.
- [ ] Define action schemas in `packages/protocol`.
- [ ] Implement media controls.
- [ ] Implement hotkey execution.
- [ ] Implement app launch.
- [ ] Implement Discord integration.
- [ ] Design a plugin SDK with manifests, permissions, widget definitions, action definitions, and runtime hooks.
- [ ] Add plugin/theme storage under the bridge data directory.

## HTTPS And Offline

- [ ] Define runtime connection modes: dev HTTP, public HTTPS, and local CA/offline.
- [ ] Design the consumer public HTTPS flow with a real domain/subdomain and DV cert automation.
- [ ] Design the advanced local CA/self-signed flow.
- [ ] Make QR codes include HTTPS URL plus short-lived pairing token.
- [ ] Verify PWA install/service worker behavior on mobile over the intended HTTPS mode.
- [ ] Ensure the desktop app works offline after setup.

## Packaging And Runtime

- [ ] Add tray/menu window behavior for the desktop app.
- [ ] Add autostart/start-at-login settings.
- [ ] Add bridge health/status screen.
- [ ] Add installer/update strategy.
- [ ] Add structured logging and diagnostics export.
- [ ] Decide where production bridge data lives per OS.

## Tests And QA

- [ ] Add layout store migration tests.
- [ ] Add socket contract tests for app snapshot, layout update, and widget events.
- [ ] Add client editor interaction tests for drag, drop, resize, and delete.
- [ ] Add bridge integration tests for pairing and layout assignment.
- [ ] Add manual QA checklist for phone/tablet connection and PWA installation.

## Open Decisions

- [ ] Socket.IO vs lower-level WebSocket for long-term transport.
- [ ] SQLite library choice and migration tool.
- [ ] Public HTTPS domain/cert provisioning model.
- [ ] Next.js migration timing and whether the desktop bridge or Next serves production assets.
- [ ] Plugin sandboxing and permission boundaries.
