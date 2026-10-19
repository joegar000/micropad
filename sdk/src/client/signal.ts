import { runInAction } from "mobx";
import { Socket } from "socket.io-client"

export class ClientSignal {
  private static signals = new Map<Socket, Map<string, ClientSignal>>();
  static get(socket: Socket, namespace: string) {
    if (!this.signals.get(socket)?.get(namespace)) {
      this.signals.set(socket, this.signals.get(socket) ?? new Map());
      this.signals.get(socket)!.set(
        namespace, new ClientSignal(socket, namespace)
      );
    }
    return this.signals.get(socket)!.get(namespace)!;

  }

  public readonly socket: Socket;
  public readonly namespace: string;
  private listeners: Map<string, ((payload?: unknown) => void)[]>;

  private constructor(socket: Socket, namespace: string) {
    this.socket = socket;
    this.namespace = namespace;
    this.listeners = new Map();
    this.socket.onAny((topEvent: string, payload?: unknown) => {
      if (topEvent.indexOf(`signal:${this.namespace}:`) !== 0) return;
      const eventName = topEvent.replace(`signal:${this.namespace}:`, '');
      const cbs = this.listeners.get(eventName);
      for (const cb of (cbs ?? [])) {
        runInAction(() => {
          cb(payload);
        });
      }
    });
  }

  on(eventName: string, cb: (payload?: unknown) => void) {
    let existing = this.listeners.get(eventName);
    if (existing && !existing.includes(cb)) {
      existing.push(cb);
    } else {
      existing = [cb];
    }
    this.listeners.set(eventName, existing);
    return () => {
      this.off(eventName, cb);
    }
  }

  off(eventName: string, cb: (payload?: unknown) => void) {
    const existing = this.listeners.get(eventName);
    const index = existing?.indexOf(cb);
    if (existing && index !== undefined && index !== -1)
      existing.splice(index, 1);
    if (!existing || existing.length === 0)
      this.listeners.delete(eventName);
  }

  send(eventName: string, payload?: any) {
    this.socket.emit(`signal:${this.namespace}:${eventName}`, payload);
  }

  destory() {
    // TODO: implement
  }
}
