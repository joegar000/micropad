import { type Socket } from 'socket.io-client';
import { useContext, createContext } from 'react';
import { ClientBridge, type ClientPlugin } from 'micropad-sdk/client';
import LayoutModel from './layout.tsx';
import createClientPluginContext from '../plugins/context.ts';
import { invariant } from 'es-toolkit/util';
import { action, computed, makeObservable, observable } from 'mobx';
import type { Schema } from '../../server/db/db.ts';

export default class AppModel {
  socket: Socket;
  plugins: ClientPlugin[];
  data: Schema["layouts"];

  constructor(params: {
    socket: Socket,
    plugins: ClientPlugin[],
    layouts: Schema["layouts"]
  }) {
    this.socket = params.socket;
    this.plugins = params.plugins;
    this.data = params.layouts;

    makeObservable(this, {
      data: observable,
      plugins: observable,
      addLayout: action,
      deleteLayout: action,
      layoutNames: computed,
      layoutLookup: computed
    });
  }

  get layouts() {
    return this.data.map(d => new LayoutModel({
      socket: this.socket,
      data: d
    }));
  }

  addLayout(name: string, defaultColumns: number = 3, defaultRows: number = 3) {
    if (name in this.layoutNames)
      return false;
    this.data.push({
      name,
      pages: [{
        columns: defaultColumns,
        rows: defaultRows,
        widgets: {},
        widgetCoords: {}
      }]
    });
    return true;
  }

  deleteLayout(name: string) {
    const index = this.data.findIndex(d => d.name === name);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
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
      layouts: (await ClientBridge.getArr<Schema["layouts"]>(socket, "db:micropad-layouts")).data
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
