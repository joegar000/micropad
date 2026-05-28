# Decision 0001: Desktop Workspace And Bridge Extraction

Date: 2026-05-27

## Status

Accepted.

## Context

The previous `apps/server` workspace name was misleading. The package does not only run a backend server; it is the Electron-owned desktop runtime that serves the client app, hosts the local bridge, opens the QR pairing window, publishes mDNS, stores layouts, loads plugins, and executes privileged desktop actions.

The project direction still calls this layer the "local runtime bridge", but the bridge currently depends on Electron startup and desktop packaging concerns. Extracting it too early would create extra workspace churn before persistence, pairing, HTTPS modes, and action permissions are stable.

## Decision

Rename `apps/server` to `apps/desktop` now.

Keep bridge code inside `apps/desktop/src/bridge` for the near term.

Defer extracting a separate bridge package/workspace until after SQLite layout persistence and pairing/device identity models are implemented. At that point the bridge boundary should be clear enough to split into a reusable package or app without guessing.

## Consequences

- Workspace commands should target `apps/desktop`.
- The desktop package is named `micropad-desktop`.
- `apps/desktop/src/desktop` contains Electron window/UI helpers.
- `apps/desktop/src/bridge` contains socket/app bridge handlers.
- Future extraction should move bridge-owned runtime code, storage interfaces, plugin loading, and action routing behind a package boundary while leaving Electron shell lifecycle and windows in `apps/desktop`.

