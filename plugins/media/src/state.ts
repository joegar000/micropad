import type { NamespacedClientSignal } from "micropad-sdk/client";
import type { NamespacedServerSignal } from "micropad-sdk/server";

export type MediaState = {
  runtimeState: {
    volume?: number;
    muted?: boolean;
    playing?: boolean;
  },
  signal: NamespacedServerSignal | NamespacedClientSignal;
};
