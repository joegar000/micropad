import type { IPreservedState, IRuntimeState } from "../shared";
import type { ClientSignal } from "./signal";

export interface IClientPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
  signal: ClientSignal;
}

export abstract class Widget {
  readonly context: IClientPluginContext
  abstract readonly displayName: string;
  abstract readonly dom: HTMLElement;

  constructor(context: IClientPluginContext) {
    this.context = context;
  }
}

type WidgetSubclass<W extends Widget = Widget> = new (context: IClientPluginContext) => W;

export abstract class ClientPlugin {
  readonly context: IClientPluginContext;
  abstract readonly displayName: string;
  protected abstract readonly widgets: { [id: string]: typeof Widget };

  constructor(context: IClientPluginContext) {
    this.context = context;
  }

  get widgetIds(): string[] {
    return Object.keys(this.widgets);
  }

  createWidget(widgetId: string): Widget {
    return new (this.widgets[widgetId] as WidgetSubclass)(this.context);
  }
}
