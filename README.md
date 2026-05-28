# Micropad — Development Setup

This README explains how to set up the project for development.

Prerequisites
- Install Node.js (an active LTS release) and npm.

Install dependencies
From the repository root run:

```bash
npm install
```

This installs dependencies for the workspace packages located in apps/client, apps/desktop, packages/*, and widgets.

Start development
- Start both client and desktop bridge (from the repo root):

```bash
npm run dev
```

- Start client only:

```bash
npm run dev --workspace=apps/client
```

- Start desktop bridge only:

```bash
npm run dev --workspace=apps/desktop
```

Notes:
- The client dev script runs Vite (vite serve .) for a fast dev server with HMR.
- The desktop dev script runs Electron against the built desktop bridge output.
- The bridge stores layouts in `~/.micropad/layouts.json` by default. Set `MICROPAD_DATA_DIR` to use a different data directory.

Useful workspace commands
- Lint the client:

```bash
npm run lint --workspace=apps/client
```

- Build the client (TypeScript compile + Vite build):

```bash
npm run build --workspace=apps/client
```

- Build the desktop bridge (TypeScript compile):

```bash
npm run build --workspace=apps/desktop
```

- Build the shared protocol package:

```bash
npm run build --workspace=packages/protocol
```

- Build the widget package:

```bash
npm run build --workspace=widgets
```

- Run the built desktop bridge:

```bash
npm run start --workspace=apps/desktop
```

Quick tips
- If you prefer separate terminals, run the client and desktop workspace commands individually instead of the combined npm run dev at root.
- If you add environment variables for the bridge, export them before running the desktop dev command.
