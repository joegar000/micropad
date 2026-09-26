import type { Socket } from "socket.io-client";
import { useContext, createContext } from 'react';
import type { ClientPlugin } from "micropad-sdk/client";

export default class AppModel {
  socket: Socket;
  plugins: ClientPlugin[];

  constructor(params: { socket: Socket, plugins: ClientPlugin[] }) {
    this.socket = params.socket;
    this.plugins = params.plugins;
  }
}

export const AppModelContext = createContext<AppModel | null>(null);

export const useApp = () => {
  const app = useContext(AppModelContext);
  if (!app)
    throw Error('Cannot call `useApp` outside of AppModelContext');
  return app;
}
