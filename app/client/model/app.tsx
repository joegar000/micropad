import { type Socket } from 'socket.io-client';
import { useContext, createContext } from 'react';
import { type ClientPlugin } from 'micropad-sdk/client';
import LayoutModel from './layout.tsx';
import createClientPluginContext from '../plugins/context.ts';
import { invariant } from 'es-toolkit/util';

export default class AppModel {
  socket: Socket;
  plugins: ClientPlugin[];
  layout: LayoutModel;

  constructor(params: {
    socket: Socket,
    plugins: ClientPlugin[],
    layout: LayoutModel
  }) {
    this.socket = params.socket;
    this.plugins = params.plugins;
    this.layout = params.layout;
  }

  static async create(socket: Socket) {
    const pluginIds: string[] = await(await fetch('/plugins')).json();
    const plugins = await Promise.all(pluginIds.map(async id => {
      const pluginModule = await import(`/plugins/${id}`);
      invariant(
        typeof pluginModule.default === "function",
        "Client entrypoint must have a default plugin class export"
      );
      const Plugin = pluginModule.default as new (...p: ConstructorParameters<typeof ClientPlugin>) => ClientPlugin;
      return new Plugin(await createClientPluginContext(socket, id));
    }));
    return new AppModel({
      socket: socket,
      plugins: plugins,
      layout: await LayoutModel.create(socket)
    })
  }
}

export const AppModelContext = createContext<AppModel | null>(null);

export const useApp = () => {
  const app = useContext(AppModelContext);
  if (!app)
    throw Error('Cannot call `useApp` outside of AppModelContext');
  return app;
}
