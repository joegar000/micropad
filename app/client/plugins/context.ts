import { Socket } from "socket.io-client";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { SocketValue } from "./socket-value.ts";

abstract class GenericSocketState {
  protected abstract prefix: string;
  protected socket: Socket;
  [key: string]: any;

  constructor(socket: Socket, _pluginName: string) {
    new Proxy<Record<string | symbol, any>>(this, { get: this.get, set: this.set });
    this.socket = socket;
  }

  protected set(target: this, property: string | symbol, newValue: any) {
    if (typeof property === 'symbol')
      throw TypeError(`Cannot set symbol properties on ${this.prefix}`);
    if (!(property in target)) {
      target[property] = new SocketValue(this.socket, this.prefix, property, newValue);
    } else {
      (target[property] as SocketValue<any>).value = newValue;
    }
    return true;
  }

  protected get(target: this, property: string | symbol) {
    if (typeof property === 'symbol')
      return undefined;
    if (!(property in target)) {
      target[property] = new SocketValue(this.socket, this.prefix, property);
    }
    return (target[property] as SocketValue<any>).value;
  }
}


class RuntimeState extends GenericSocketState implements IRuntimeState {
  [key: string]: any;
  protected prefix: string;


  constructor(socket: Socket, pluginName: string) {
    super(socket, pluginName);
    this.prefix = `runtime:${pluginName}`;
  }
}

class PreservedState extends GenericSocketState implements IPreservedState {
  enabled: boolean;
  [key: string]: any;
  protected prefix: string;

  constructor(socket: Socket, pluginName: string) {
    super(socket, pluginName);
    this.prefix = `preserved:${pluginName}`;
    this.enabled = true;
  }
}

export default class ClientPluginContext {
  runtimeState: RuntimeState;
  preservedState: PreservedState;

  constructor(socket: Socket, pluginName: string) {
    this.runtimeState = new RuntimeState(socket, pluginName);
    this.preservedState = new PreservedState(socket, pluginName);
  }
}
