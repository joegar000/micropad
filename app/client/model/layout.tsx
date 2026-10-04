import { type Socket } from "socket.io-client";
import { type Schema } from "../../server/db/db.ts";
import { createContext } from "react";
import { useApp } from "./app.tsx";
import { bridge, ClientPlugin } from "micropad-sdk/client";
import { action, computed, makeObservable, observable } from "mobx";
import PageModel from "./page.tsx";

export default class LayoutModel {
  socket: Socket;
  data: Schema["layouts"];
  cellHeight: number = 0;
  gridHeight: number = 0;
  gridWidth: number = 0;

  constructor(params: { socket: Socket; data: Schema["layouts"] }) {
    this.socket = params.socket;
    this.data = params.data;

    makeObservable(this, {
      data: observable,
      cellHeight: observable,
      gridHeight: observable,
      gridWidth: observable,
      layoutNames: computed,
      pagesLookup: computed,
      usedIds: computed,
      addLayout: action,
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

  get pagesLookup() {
    return Object.keys(this.data).reduce<
      { [layoutName: string]: PageModel[] }
    >(
      (lookups, layoutName) => ({
        ...lookups,
        [layoutName]: this.data[layoutName].map((d, i) => new PageModel(d, i)),
      }),
      {},
    )
  }

  get usedIds() {
    return Object.keys(this.data).reduce((usedIds, layoutName) => {
      const ids = this.data[layoutName].flatMap((page) =>
        Object.keys(page.widgets),
      );
      ids.forEach(id => usedIds.add(id));
      return usedIds;
    }, new Set<string>());
  }

  addLayout(name: string, columns: number = 3, rows: number = 3) {
    if (name in this.data)
      return false;
    this.data[name] = [{
      columns,
      rows,
      widgets: {},
      widgetCoords: {}
    }];
    return true;
  }

  addPage(layoutName: string, index = Infinity) {
    this.data[layoutName].splice(index, 0, {
      columns: 3,
      rows: 3,
      widgets: {},
      widgetCoords: {}
    });
  }

  static async create(socket: Socket) {
    const { data } = await bridge(socket, "db:micropad-layouts");
    return new LayoutModel({ socket, data });
  }
}

export const LayoutModelContext = createContext<LayoutModel | null>(null);

export const useLayout = () => useApp().layout;
