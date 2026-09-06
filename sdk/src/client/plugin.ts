import type { IPreservedState, IRuntimeState } from "../shared";

export interface ClientPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
}

abstract class Widget {
  context: ClientPluginContext
  abstract name: string;
  abstract dom: HTMLElement;

  constructor(context: ClientPluginContext) {
    this.context = context;
  }
}

export default abstract class ClientPlugin {
  abstract pluginName: string;
  abstract widgets: (typeof Widget)[];

  constructor() {}

  abstract init(context: ClientPluginContext): void;
}
