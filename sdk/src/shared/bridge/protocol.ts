import { type Operation } from "fast-json-patch";

export type Snapshot = {
  status: "ok";
  body: Record<string, unknown>;
};

export type Write = {
  patches: Operation[];
};

export type WriteResult = { status: "ok" } | { status: "invalid", body: Record<string, unknown> };

