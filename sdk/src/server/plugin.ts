import type { IPreservedState, IRuntimeState } from "../shared/state";
import type { ServerSignal } from "./signal";

export interface ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
  signal: ServerSignal;
}

export abstract class ServerPlugin {
  abstract pluginName: string;

  constructor() {}

  abstract init(context: ServerPluginContext): void;
}
