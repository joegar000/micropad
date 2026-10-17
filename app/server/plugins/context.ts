import { Socket } from "socket.io";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { DB } from "../db/db.ts";
import { reaction, runInAction } from "mobx";
import { clone } from "es-toolkit/compat";
import { ServerBridge, ServerSignal } from "micropad-sdk/server";

export function runtimeState(socket: Socket, pluginId: string): IRuntimeState {
  const bridge = ServerBridge.get<IRuntimeState>(`runtime:${pluginId}`);
  bridge.attach(socket);
  return bridge.data;
}

export function preservedState(socket: Socket, pluginId: string): IPreservedState {
  runInAction(() => {
    DB.data.pluginState ??= {};
    DB.data.pluginState[pluginId] ??= {};
  });

  const pluginState = DB.data.pluginState![pluginId];
  const bridge = ServerBridge.get<IPreservedState>(`db:${pluginId}`);
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
      DB.data.pluginState![pluginId] = clone(bridge.data);
    }
  );

  bridge.attach(socket);

  return bridge.data;
}

export class ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;
  signal: ServerSignal

  constructor(socket: Socket, pluginId: string) {
    this.runtimeState = runtimeState(socket, pluginId);
    this.preservedState = preservedState(socket, pluginId);
    this.signal = ServerSignal.get(pluginId);
  }
}
