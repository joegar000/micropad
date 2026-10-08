import { type Socket } from "socket.io-client";
import { type Schema } from "../../server/db/db.ts";
import { createContext, useContext } from "react";
import { ClientBridge, ClientPlugin } from "micropad-sdk/client";
import { action, computed, makeObservable, observable } from "mobx";
import PageModel from "./page.tsx";

export default class LayoutModel {
  socket: Socket;
  data: Schema["layouts"][number];

  constructor(params: { socket: Socket, data: Schema["layouts"][number] }) {
    this.socket = params.socket;
    this.data = params.data;

    makeObservable(this, {
      data: observable,
      layoutNames: computed,
      pages: computed,
      usedIds: computed,
      addPage: action
    });
  }

  /**
   * Creates a new widget whose uniqId is not yet used.
   * Responds to mobx changes since it checks if `id in this.usedIds`
   */
  newWidget(plugin: ClientPlugin, widgetId: string) {
    return {
      uniqId: this.createId(),
      pluginId: plugin.displayName,
      widgetId: widgetId,
    };
  }

  private createId(): string {
    const id = `${Math.random()}`.replace("0.", "");
    if (this.usedIds.has(id)) return this.createId();
    return id;
  }

  get layoutNames() {
    return Object.keys(this.data);
  }

  get pages() {
    return this.data.pages.map((p, i) => {
      return new PageModel(p, i);
    });
  }

  get usedIds() {
    return Object.keys(this.data).reduce((usedIds) => {
      const ids = this.data.pages.flatMap((page) =>
        Object.keys(page.widgets),
      );
      ids.forEach(id => usedIds.add(id));
      return usedIds;
    }, new Set<string>());
  }

  addPage(index = Infinity, defaultColumns = 3, defaultRows = 3) {
    this.data.pages.splice(index, 0, {
      columns: defaultColumns,
      rows: defaultRows,
      widgets: {},
      widgetCoords: {}
    });
  }

  static async pullLayouts(socket: Socket) {
    const bridge = await ClientBridge.getArr(socket, "db:micropad-layouts");
    return bridge.data.map(d => {
      return new LayoutModel({ socket, data: d });
    });
  }
}

export const LayoutModelContext = createContext<LayoutModel | null>(null);

export const useLayout = () => {
  const layout = useContext(LayoutModelContext);
  if (!layout)
    throw Error('Cannot call `useLayout` outside of AppModelContext');
  return layout;
}

