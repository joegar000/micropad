import { Socket } from "socket.io-client"

export type NamespacedClientSignal = ReturnType<ReturnType<typeof clientSignalGenerator>>;

export function clientSignalGenerator(socket: Socket) {
  const getSignal = (namespace: string) => {
    const on = (eventName: string, cb: (payload?: unknown) => void) => {
      eventName = `signal:${namespace}:${eventName}`;
      socket.on(eventName, cb);
      return () => {
        off(eventName, cb);
      };
    };
    const off = (eventName: string, cb: (payload?: unknown) => void) => {
      eventName = `signal:${namespace}:${eventName}`;
      socket.off(eventName, cb);
    };
    const send = (eventName: string, payload?: any) => {
      eventName = `signal:${namespace}:${eventName}`;
      socket.emit(eventName, payload);
    }
    return { on, off, send };
  }
  return getSignal;
}

