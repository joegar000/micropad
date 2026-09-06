import { Socket } from "socket.io";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { SocketValue } from "./socket-value.ts";
import { DB } from "../db/db.ts";
import { reaction } from "mobx";
import { clone } from "es-toolkit/compat";

abstract class GenericSocketState {
  protected readonly prefix: string;
  protected readonly socket: Socket;
  protected readonly target: Record<string, any>;
  [key: string]: any;

  constructor(socket: Socket, prefix: string) {
    this.socket = socket;
    this.target = {};
    this.prefix = prefix;
    new Proxy<Record<string | symbol, any>>(this, { get: this.get, set: this.set });
  }

  protected set(_target: this, property: string | symbol, newValue: any) {
    if (typeof property === 'symbol')
      throw TypeError(`Cannot set symbol properties on ${this.prefix}`);
    if (!(property in this.target)) {
      this.target[property] = new SocketValue(this.socket, this.prefix, property, newValue);
    } else {
      (this.target[property] as SocketValue<any>).value = newValue;
    }
    return true;
  }

  protected get(_target: this, property: string | symbol) {
    if (typeof property === 'symbol')
      return undefined;
    if (!(property in this.target)) {
      this.target[property] = new SocketValue(this.socket, this.prefix, property);
    }
    return (this.target[property] as SocketValue<any>).value;
  }

  toJSON() {
    return this.target;
  }
}


class RuntimeState extends GenericSocketState implements IRuntimeState {
  [key: string]: any;


  constructor(socket: Socket, pluginName: string) {
    super(socket, `runtime:${pluginName}`);
  }
}

class PreservedState extends GenericSocketState implements IPreservedState {
  enabled: boolean;
  [key: string]: any;
  protected pluginDB: any;

  constructor(socket: Socket, pluginName: string) {
    super(socket, `preserved:${pluginName}`);
    DB.data.pluginState ??= {};
    DB.data.pluginState[pluginName] ??= {};
    reaction(
      () => JSON.stringify(this.target),
      () => (DB.data.pluginState[pluginName] = clone(this.target))
    );
    this.enabled = true;
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
