import { createContext, use, useCallback, useEffect, type ReactNode } from "react";
import { type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider(props: { socket: Socket, children: ReactNode }) {
  return (
    <SocketContext.Provider value={props.socket}>
      {props.children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = use(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
}

export function emitWidgetEvent(socket: Socket, widgetType: string, event: string, data?: unknown) {
  const [pluginName, widgetName] = widgetType.split('.');
  socket.emit(`${pluginName}:${widgetName}:${event}`, data);
}

export function useWidgetEventEmitter(widgetType: string) {
  const socket = useSocket();
  return useCallback((event: string, data?: unknown) => {
    return emitWidgetEvent(socket, widgetType, event, data);
  }, []);
}

export function useWidgetUpdateListener(widgetType: string, callback: (data: any) => void) {
  const socket = useSocket();

  useEffect(() => {
    const [pluginName, widgetName] = widgetType.split('.');
    const updateEvent = `${pluginName}:${widgetName}:update`;

    socket.on(updateEvent, callback);
    return () => {
      socket.off(updateEvent, callback);
    };
  }, [socket, widgetType, callback]);
}
