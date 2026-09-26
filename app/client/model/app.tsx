import type { Socket } from "socket.io-client";
import { useContext, createContext } from 'react';
import type { ClientPlugin } from "micropad-sdk/client";
import ClientPluginContext from "../plugins/context.ts";

export default class AppModel {
  socket: Socket;
  plugins: ClientPlugin[];

  constructor(params: { socket: Socket, plugins: (new () => ClientPlugin)[] }) {
    this.socket = params.socket;

    this.plugins = params.plugins.map(Plugin => new Plugin());
    for (const p of this.plugins) {
      p.init(new ClientPluginContext(this.socket, p.pluginName));
    }
  }
}

export const AppModelContext = createContext<AppModel | null>(null);

export const useApp = () => {
  const app = useContext(AppModelContext);
  if (!app)
    throw Error('Cannot call `useApp` outside of AppModelContext');
  return app;
}
