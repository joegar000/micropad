# Tasks: Micropad Platform Foundation

## Phase 1: Persistence And Layout Contracts

- [ ] Choose SQLite library and migration approach.
- [ ] Define SQLite tables for layouts, pages, widget instances, devices, sessions, and layout assignments.
- [ ] Replace `FileLayoutStore` with SQLite-backed storage.
- [ ] Add migration from bridge JSON layout file.
- [ ] Add migration from old client IndexedDB layout stores.
- [ ] Add layout store tests.
- [ ] Add protocol schema tests.

## Phase 2: Pairing And Device Identity

- [ ] Add pairing token schema to `packages/protocol`.
- [ ] Add bridge pairing token creation and expiry.
- [ ] Add QR URL format with short-lived token.
- [ ] Add client handshake that reports device profile.
- [ ] Persist device identity and session identity.
- [ ] Add layout assignment lookup for paired devices.
- [ ] Add connection and pairing error UI.

## Phase 3: Secure Runtime Modes

- [ ] Define runtime mode config: `dev-http`, `public-https`, and `local-ca`.
- [ ] Design public HTTPS domain/subdomain provisioning.
- [ ] Design local CA/offline setup path.
- [ ] Update QR generation to prefer secure URLs outside dev mode.
- [ ] Verify service worker registration on mobile over HTTPS.
- [ ] Document runtime mode setup and troubleshooting.

## Phase 4: Actions And Plugin Boundary

- [ ] Define action schemas in `packages/protocol`.
- [ ] Split widget catalog definitions from action definitions.
- [ ] Add plugin manifest schema.
- [ ] Add permission declarations for privileged actions.
- [ ] Implement media controls.
- [ ] Implement hotkey execution.
- [ ] Implement app launch.
- [ ] Implement Discord integration.

## Phase 5: Editor Completeness

- [ ] Add page list and page switching UI.
- [ ] Add create, rename, reorder, and delete page flows.
- [ ] Add widget instance configuration editing.
- [ ] Enforce grid bounds when rows/columns shrink.
- [ ] Add sync/save/error state in the editor.
- [ ] Add mobile/tablet viewport QA checklist.

## Cross-Cutting Verification

- [ ] `npm run build`.
- [ ] `npm run lint --workspace=apps/client`.
- [ ] Widget package build through root build.
- [ ] Manual desktop bridge launch.
- [ ] Manual phone/tablet pairing smoke test once pairing exists.

