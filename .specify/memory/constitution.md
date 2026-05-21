# Micropad Constitution

## Principle 1: Local-First Runtime Authority

The desktop bridge is the authority for saved layouts, pairing, plugin/theme hosting, and privileged desktop actions. Clients may cache state for responsiveness, but canonical persisted state must live on the bridge.

Implications:

- Layout persistence belongs in the bridge data directory, not only in browser IndexedDB.
- Widget events that execute desktop actions must route through the bridge.
- Offline-after-setup behavior is a product requirement, not a best-effort optimization.

## Principle 2: Secure Mobile PWA By Design

Phone and tablet clients need a secure context for real PWA behavior. Consumer onboarding should not depend on users trusting a local self-signed certificate authority.

Implications:

- Plain HTTP is acceptable only for local development.
- The preferred consumer path is public HTTPS with a real domain/subdomain and DV certificate automation.
- Local CA/self-signed certificates are an advanced/offline-only path.

## Principle 3: Protocol-First Boundaries

Client, bridge, widgets, plugins, and future transports must communicate through explicit, versioned contracts.

Implications:

- Shared schemas belong in `packages/protocol`.
- Persisted data must use Micropad domain models instead of UI-library internals.
- Socket event payloads should validate at boundaries.
- Version migrations must be planned before changing persisted schemas.

## Principle 4: Device-Aware Layouts

Layouts are per device by default, while saved layouts remain reusable across devices.

Implications:

- Pairing must produce durable device identity and session/client identity.
- Device profile data should include screen size, DPR, orientation, user label, and device kind.
- Layout assignment should be explicit and bridge-owned.

## Principle 5: Feature Slices Must Be Verifiable

Implementation should move in small, independently testable slices.

Implications:

- Major work should include or update a `.specify/specs/<NNN-feature>/` spec, plan, and tasks.
- Every meaningful code change should run `npm run build`.
- Client changes should also run `npm run lint --workspace=apps/client`.
- Widget package lint is currently not configured; widget verification is through build until that changes.

## Principle 6: Plugins And Actions Require Explicit Permissions

Widgets are presentation and input surfaces. Actions are privileged operations. The bridge must mediate actions through clear permissions and manifests.

Implications:

- Separate widget definitions from action definitions.
- Plugin manifests should declare widgets, actions, permissions, and runtime hooks.
- Desktop actions such as hotkeys, app launch, media controls, and Discord integration should be auditable.

## Governance

- This constitution should be updated when durable product or architecture decisions change.
- Specs and plans should include a brief constitution check for the principles they affect.
- If implementation pressure conflicts with these principles, record the tradeoff in the relevant spec or `TASKS.md` before proceeding.

