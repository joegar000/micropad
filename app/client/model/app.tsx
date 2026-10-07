import { type Socket } from 'socket.io-client';
import { useContext, createContext } from 'react';
import { type ClientPlugin } from 'micropad-sdk/client';
import LayoutModel from './layout.tsx';
import createClientPluginContext from '../plugins/context.ts';
import { invariant } from 'es-toolkit/util';
import { action, computed, makeObservable, observable } from 'mobx';

export default class AppModel {
  socket: Socket;
  plugins: ClientPlugin[];
  layouts: LayoutModel[];

  constructor(params: {
    socket: Socket,
    plugins: ClientPlugin[],
    layouts: LayoutModel[]
  }) {
    this.socket = params.socket;
    this.plugins = params.plugins;
    this.layouts = params.layouts;

    makeObservable(this, {
      layouts: observable,
      plugins: observable,
      addLayout: action,
      layoutNames: computed,
      layoutLookup: computed
    });
  }

  addLayout(name: string, defaultColumns: number = 3, defaultRows: number = 3) {
    if (name in this.layoutNames)
      return false;
    this.layouts.push(new LayoutModel({
      socket: this.socket,
      data: {
        name,
        pages: [{
          columns: defaultColumns,
          rows: defaultRows,
          widgets: {},
          widgetCoords: {}
        }]
      }
    }));
    return true;
  }

  get layoutNames() {
    return this.layouts.map(l => l.data.name);
  }

  get layoutLookup() {
    return this.layouts.reduce((lookup, layout) => {
      return { ...lookup, [layout.data.name]: layout };
    }, {} as Record<string, LayoutModel>);
  }

  static async create(socket: Socket) {
    const pluginIds: string[] = await (await fetch('/plugins')).json();
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
      layouts: await LayoutModel.pullLayouts(socket)
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
