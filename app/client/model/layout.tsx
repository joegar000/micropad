import { type Socket } from "socket.io-client";
import { type Schema } from "../../server/db/db.ts";
import { createContext } from "react";
import { useApp } from "./app.tsx";
import { bridge, ClientPlugin } from "micropad-sdk/client";
import { computed, makeObservable, observable } from "mobx";
import PageLayout from "./page.tsx";

export default class LayoutModel {
  socket: Socket;
  pagesLookup: { [layoutName: string]: PageLayout[] };
  data: Schema["layouts"];
  cellHeight: number = 0;
  gridHeight: number = 0;
  gridWidth: number = 0;

  constructor(params: { socket: Socket; data: Schema["layouts"] }) {
    this.socket = params.socket;
    this.data = params.data;
    this.pagesLookup = Object.keys(this.data).reduce<
      LayoutModel["pagesLookup"]
    >(
      (lookups, layoutName) => ({
        ...lookups,
        [layoutName]: this.data[layoutName].map((d) => new PageLayout(d)),
      }),
      {},
    );

    makeObservable(this, {
      cellHeight: observable,
      gridHeight: observable,
      gridWidth: observable,
      usedIds: computed,
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

  get usedIds() {
    return Object.keys(this.data).reduce((usedIds, layoutName) => {
      const ids = this.data[layoutName].flatMap((page) =>
        Object.keys(page.widgets),
      );
      ids.forEach(id => usedIds.add(id));
      return usedIds;
    }, new Set<string>());
  }

  static async create(socket: Socket) {
    const { data } = await bridge(socket, "db:micropad-layouts");
    return new LayoutModel({ socket, data });
  }
}

export const LayoutModelContext = createContext<LayoutModel | null>(null);

export const useLayout = () => useApp().layout;
