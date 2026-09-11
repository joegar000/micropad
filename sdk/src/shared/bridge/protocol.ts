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


function snapshot(payload: Snapshot): void {
  return (callback: (payload: Snapshot) => void) => {
    callback(payload);
  }
}

function write(payload: Write): void {
  return payload;
}

function writeAck(payload: WriteResult, callback: (payload: WriteResult)): void {
  callback(payload);
}

/** Simple object containing utility functions for type assistance. */
export const Protocol = {
  snapshot, write, writeAck
}
