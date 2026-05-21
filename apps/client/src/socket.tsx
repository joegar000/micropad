/* eslint-disable react-refresh/only-export-components */
import { createContext, use, type ReactNode } from "react";
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
    throw new Error("useSocket must be used within a SocketProvider and connection must be established");
  }
  return socket;
}
