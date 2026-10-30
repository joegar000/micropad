import type { IPreservedState, IRuntimeState } from "../shared/state";
import type { ServerSignal } from "./signal";
import { z } from "zod";

export const pluginManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  minAppVersion: z.string().min(1),
  description: z.string(),
  author: z.string().min(1),
  entrypoints: z.object({
    server: z.string().min(1),
    client: z.string().min(1),
  }),
});

export type PluginManifestSchema = z.infer<typeof pluginManifestSchema>;

export interface ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
  signal: ServerSignal;
}

export abstract class ServerPlugin {
  manifest: PluginManifestSchema;

  constructor(manifest: PluginManifestSchema) {
    this.manifest = manifest;
  }

  abstract init(context: ServerPluginContext): void;
}

