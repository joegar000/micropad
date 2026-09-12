import { type Operation } from "fast-json-patch";

export type Snapshot = {
  status: "ok";
  revision: number;
  body: Record<string, unknown>;
};

export type Write = {
  id: string;           // client-generated UUID, for deduplication
  baseRevision: number; // revision the client edited
  patches: Operation[];
};

export type WriteResult =
  | { status: "ok"; revision: number }
  | { status: "conflict"; revision: number; body: Record<string, unknown> }
  | { status: "invalid"; reason: string };

