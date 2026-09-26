import type { IPreservedState, IRuntimeState } from "../shared";

export interface ClientPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
}

export abstract class Widget {
  readonly context: ClientPluginContext
  abstract readonly displayName: string;
  abstract readonly dom: HTMLElement;

  constructor(context: ClientPluginContext) {
    this.context = context;
  }
}

export abstract class ClientPlugin {
  abstract readonly displayName: string;
  abstract readonly widgets: { [id: string]: typeof Widget };

  constructor() {}

  init?(context: ClientPluginContext): void;
}
