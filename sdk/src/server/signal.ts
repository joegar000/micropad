import type { Socket } from "socket.io";

export class ServerSignal {
  private static signals = new Map<string, ServerSignal>();
  static get(namespace: string) {
    if (this.signals.has(namespace))
      return this.signals.get(namespace)!;
    this.signals.set(namespace, new ServerSignal(namespace));
    return this.signals.get(namespace)!;
  }

  public readonly namespace: string;
  private listeners: Map<string, ((payload: unknown) => void)[]>;
  private sockets: Map<Socket, () => void>;

  private constructor(namespace: string) {
    this.namespace = namespace;
    this.listeners = new Map();
    this.sockets = new Map();
  }

  on(eventName: string, cb: (payload: unknown) => void) {
    let existing = this.listeners.get(eventName);
    if (existing)
      existing.push(cb);
    else
      existing = [cb];
    return () => {
      this.off(eventName, cb);
    }
  }

  off(eventName: string, cb: (payload: unknown) => void) {
    const existing = this.listeners.get(eventName);
    if (!existing || existing.length === 0) return;
    const index = existing.indexOf(cb);
    if (index !== -1)
      existing.splice(index, 1);
  }

  send(eventName: string, payload: any) {
    for (const socket of this.sockets.keys()) {
      socket.emit(`signal:${this.namespace}:${eventName}`, payload);
    }
  }

  attach(socket: Socket) {
    const callback = (topEvent: string, payload: unknown) => {
      if (topEvent.indexOf(`signal:${this.namespace}:`) !== 0) return;
      const eventName = topEvent.replace(`signal:${this.namespace}:`, '');
      const cbs = this.listeners.get(eventName);
      for (const cb of (cbs ?? [])) {
        cb(payload);
      }
    };

    socket.onAny(callback);
  }

  detach(socket: Socket) {
    const callback = this.sockets.get(socket);
    if (callback) {
      socket.offAny(callback);
    }
  }
}
