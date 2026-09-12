import { Socket } from "socket.io";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { DB } from "../db/db.ts";
import { reaction } from "mobx";
import { clone } from "es-toolkit/compat";
import { bridge } from "micropad-sdk/server";

class RuntimeState implements IRuntimeState {
  [key: string]: any;

  constructor(socket: Socket, pluginName: string) {
    const { data, attach } = bridge(`runtime:${pluginName}`);
    attach(socket);
    return data;
  }
}

class PreservedState implements IPreservedState {
  enabled: boolean = true;
  [key: string]: any;

  constructor(socket: Socket, pluginName: string) {
    DB.data.pluginState ??= {};
    DB.data.pluginState[pluginName] ??= {};

    const pluginState = DB.data.pluginState[pluginName];
    const { data, attach } = bridge(`db:${pluginName}`);
    for (const key of Object.keys(data)) {
      delete data[key];
    }
    for (const key of Object.keys(pluginState)) {
      data[key] = pluginState[key];
    }
    data.enabled ??= true;

    reaction(
      () => JSON.stringify(data),
      () => {
        DB.data.pluginState![pluginName] = clone(data);
      }
    );

    attach(socket);

    return data as IPreservedState;
  }
}

export class ServerPluginContext {
  runtimeState: RuntimeState;
  preservedState: PreservedState;

  constructor(socket: Socket, pluginName: string) {
    this.runtimeState = new RuntimeState(socket, pluginName);
    this.preservedState = new PreservedState(socket, pluginName);
  }
}
