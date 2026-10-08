import { Socket } from "socket.io";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { DB } from "../db/db.ts";
import { reaction, runInAction } from "mobx";
import { clone } from "es-toolkit/compat";
import { ServerBridge } from "micropad-sdk/server";

export function runtimeState(socket: Socket, pluginName: string): IRuntimeState {
  const bridge = ServerBridge.get<IRuntimeState>(`runtime:${pluginName}`);
  bridge.attach(socket);
  return bridge.data;
}

export function preservedState(socket: Socket, pluginName: string): IPreservedState {
  runInAction(() => {
    DB.data.pluginState ??= {};
    DB.data.pluginState[pluginName] ??= {};
  });

  const pluginState = DB.data.pluginState![pluginName];
  const bridge = ServerBridge.get<IPreservedState>(`db:${pluginName}`);
  runInAction(() => {
    for (const key of Object.keys(bridge.data)) {
      delete bridge.data[key];
    }
    for (const key of Object.keys(pluginState)) {
      bridge.data[key] = pluginState[key];
    }
    bridge.data.enabled ??= true;
  });

  reaction(
    () => JSON.stringify(bridge.data),
    () => {
      DB.data.pluginState![pluginName] = clone(bridge.data);
    }
  );

  bridge.attach(socket);

  return bridge.data;
}

export class ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;

  constructor(socket: Socket, pluginName: string) {
    this.runtimeState = runtimeState(socket, pluginName);
    this.preservedState = preservedState(socket, pluginName);
  }
}
