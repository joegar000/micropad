import type { Socket, Server } from "socket.io";

export function serverSignalGenerator(io: Server) {
  const sockets = new Set<Socket>();
  const listeners = new Map<string, ((payload?: unknown) => void)[]>();
  io.on('connection', socket => {
    sockets.add(socket);
    for (const [eventName, cbs] of listeners.entries()) {
      for (const cb of cbs) {
        socket.on(eventName, cb);
      }
    }

    socket.on('disconnect', () => {
      for (const [eventName, cbs] of listeners.entries()) {
        for (const cb of cbs) {
          socket.off(eventName, cb);
        }
      }
      sockets.delete(socket);
    });
  });

  const getSignal = (namespace: string) => {
    const on = (eventName: string, cb: (payload?: unknown) => void) => {
      eventName = `signal:${namespace}:${eventName}`;
      let existing = listeners.get(eventName);
      if (existing && !existing.includes(cb)) {
        existing.push(cb);
      } else {
        existing = [cb];
      }
      listeners.set(eventName, existing);

      for (const socket of sockets.values()) {
        socket.on(eventName, cb);
      }

      return () => {
        off(eventName, cb);
      }
    };
    const off = (eventName: string, cb: (payload?: unknown) => void) => {
      eventName = `signal:${namespace}:${eventName}`;
      const existing = listeners.get(eventName);
      if (!existing || existing.length === 0) return;
      const index = existing.indexOf(cb);
      if (index !== -1) {
        existing.splice(index, 1);
      }

      for (const socket of sockets.values()) {
        socket.off(eventName, cb);
      }
    };
    const send = (eventName: string, payload?: any) => {
      eventName = `signal:${namespace}:${eventName}`;
      for (const socket of sockets.values()) {
        socket.emit(eventName, payload);
      }
    }
    return { on, off, send };
  }
  return getSignal;
}
