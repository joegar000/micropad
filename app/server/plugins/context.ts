import { Socket } from "socket.io";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { DB } from "../db/db.ts";
import { reaction, runInAction } from "mobx";
import { clone } from "es-toolkit/compat";
import { bridge } from "micropad-sdk/server";

export function runtimeState(socket: Socket, pluginName: string): IRuntimeState {
  const { data, attach } = bridge<IRuntimeState>(`runtime:${pluginName}`);
  attach(socket);
  return data;
}

export function preservedState(socket: Socket, pluginName: string): IPreservedState {
  runInAction(() => {
    DB.data.pluginState ??= {};
    DB.data.pluginState[pluginName] ??= {};
  });

  const pluginState = DB.data.pluginState![pluginName];
  const { data, attach } = bridge<IPreservedState>(`db:${pluginName}`);
  runInAction(() => {
    for (const key of Object.keys(data)) {
      delete data[key];
    }
    for (const key of Object.keys(pluginState)) {
      data[key] = pluginState[key];
    }
    data.enabled ??= true;
  });

  reaction(
    () => JSON.stringify(data),
    () => {
      DB.data.pluginState![pluginName] = clone(data);
    }
  );

  attach(socket);

  return data;
}

export class ServerPluginContext {
  runtimeState: IRuntimeState;
  preservedState: IPreservedState;

  constructor(socket: Socket, pluginName: string) {
    this.runtimeState = runtimeState(socket, pluginName);
    this.preservedState = preservedState(socket, pluginName);
  }
}
