import type { IPreservedState, IRuntimeState } from "../shared/state";

export interface ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
}

export abstract class ServerPlugin {
  abstract pluginName: string;

  constructor() {}

  abstract init(context: ServerPluginContext): void;
}
