import { Socket } from "socket.io-client";
import { useContext, createContext } from 'react';

export default class AppModel {
  socket: Socket;

  constructor(params: { socket: Socket }) {
    this.socket = params.socket;
    this.socket.emitWithAck('get:plugins');
  }
}

export const AppModelContext = createContext<AppModel | null>(null);

export const useApp = () => {
  const app = useContext(AppModelContext);
  if (!app)
    throw Error('Cannot call `useApp` outside of AppModelContext');
  return app;
}
