# Spec: Micropad Platform Foundation

## Status

Draft. This spec captures the platform direction already in motion and should guide the next major slices.

## Goal

Micropad should behave as a local-first Stream Deck alternative where a desktop-owned bridge serves and coordinates phone/tablet control surfaces over local Wi-Fi, while preserving secure PWA behavior and offline-after-setup operation.

## Users

- Desktop user who wants to control local apps, media, hotkeys, and integrations from a phone or tablet.
- Returning mobile client that should reconnect to the known desktop bridge without redoing setup.
- Advanced user who wants offline-only local connectivity with an explicit local certificate path.
- Plugin/action author who needs stable schemas and clear runtime boundaries.

## User Stories

### US1: Pair A Mobile Client

As a desktop user, I can open Micropad on the desktop, scan a QR code from my phone or tablet, and pair the client with the bridge.

Acceptance criteria:

- The QR code contains a short-lived pairing token.
- The bridge records a durable device identity after successful pairing.
- The client reports its device profile.
- Pairing failure is visible to the client and desktop user.

### US2: Reuse And Assign Layouts

As a user, I can keep layouts on the desktop bridge and assign them to devices, while clients cache enough state for responsive editing.

Acceptance criteria:

- The bridge stores canonical layouts.
- A layout can contain multiple pages.
- Widgets can span square grid cells.
- A device has an explicit layout assignment.
- Client-side layout edits are acknowledged or rejected by the bridge.

### US3: Execute Privileged Desktop Actions

As a user, pressing or changing a widget on the mobile client executes a desktop-owned action through the bridge.

Acceptance criteria:

- Widget events identify widget instance, widget type, page, layout, device/client when available, action name, payload, and timestamp.
- The bridge validates the event envelope before executing actions.
- Actions are defined separately from widget presentation.
- Initial actions cover media controls, app launch, hotkeys, and Discord integration.

### US4: Work As A Real PWA

As a phone/tablet user, I can install or use Micropad as a PWA without disabling browser security.

Acceptance criteria:

- Consumer setup uses a secure HTTPS context.
- Plain HTTP remains limited to development mode.
- The advanced local CA mode is explicit and not required for normal users.
- The app continues to work offline after setup where platform constraints allow it.

## Non-Goals

- Public cloud synchronization of user layouts.
- Multi-user account management.
- Marketplace distribution for third-party plugins.
- Replacing native desktop security prompts or OS permission systems.

## Functional Requirements

- The bridge must serve the client app and expose realtime transport for widget events.
- The bridge must persist layouts and device assignments.
- The client must render pages of square grid cells with resizable widget instances.
- Shared protocol schemas must version persisted and socket data.
- The bridge must advertise itself with mDNS/DNS-SD where available.
- QR/manual pairing must remain available even when discovery fails.

## Quality Requirements

- Secure-by-default consumer onboarding.
- Offline-after-setup operation for the desktop bridge and paired clients.
- Incremental migration from current Vite/Electron/Socket.IO stack.
- Clear upgrade path for persisted layout schema changes.
- Build verification through `npm run build`.

## Open Questions

- Which SQLite library and migration tool should be used?
- Should Socket.IO remain long-term or be replaced by lower-level WebSocket transport?
- What exact public HTTPS provisioning model should be used?
- When should the client move from Vite to Next.js?
- How should plugin permissions be represented and approved?

