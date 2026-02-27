# Micropad — Development Setup

This README explains how to set up the project for development.

Prerequisites
- Install Node.js (an active LTS release) and npm.

Install dependencies
From the repository root run:

```bash
npm install
```

This installs dependencies for the workspace packages located in apps/client and apps/server.

Start development servers
- Start both client and server (from the repo root):

```bash
npm run dev
```

- Start client only:

```bash
npm run dev --workspace=apps/client
```

- Start server only:

```bash
npm run dev --workspace=apps/server
```

Notes:
- The client dev script runs Vite (vite serve .) for a fast dev server with HMR.
- The server dev script runs tsx watch src/index.ts (automatic restart on changes).

Useful workspace commands
- Lint the client:

```bash
npm run lint --workspace=apps/client
```

- Build the client (TypeScript compile + Vite build):

```bash
npm run build --workspace=apps/client
```

- Build the server (TypeScript compile):

```bash
npm run build --workspace=apps/server
```

- Run the built server:

```bash
npm run start --workspace=apps/server
```

Quick tips
- If you prefer separate terminals, run the client and server workspace commands individually instead of the combined npm run dev at root.
- If you add environment variables for the server, export them before running the server dev command.
