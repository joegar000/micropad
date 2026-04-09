import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";
import type { LayoutItem } from "react-grid-layout";
import type { IWidgetModel } from "micropad-widgets";


export interface WidgetMeta {
  [id: string]: Pick<IWidgetModel, 'type'>;
}

export interface ConnectionInfo {
  /** A human-friendly name for the connection (optional). */
  name?: string;
  /** The full socket URL (including protocol). */
  url: string;
}

interface LayoutState {
  widgetMeta: WidgetMeta;
  widgets: LayoutItem[];
  rows: number;
  columns: number;
  connections: ConnectionInfo[];
  selectedConnectionUrl?: string;
  setRows: ValueOrCallback<number>;
  setColumns: ValueOrCallback<number>;
  setLayout: ValueOrCallback<LayoutItem[]>;
  setLayoutMeta: ValueOrCallback<WidgetMeta>;
  addOrSelectConnection: (connection: ConnectionInfo) => void;
  selectConnection: (url?: string) => void;
  removeConnection: (url: string) => void;
}

export const widgetIdStore = createIdStore();

let resolveLoading: () => void;
export const layoutLoad = new Promise<void>(resolve => {
  resolveLoading = resolve;
});

export const useLayoutStore = create<LayoutState>()(
  persist(
    ((set) => ({
      widgets: [],
      widgetMeta: {},
      rows: 2,
      columns: 3,
      connections: [],
      selectedConnectionUrl: undefined,
      setLayout: (widgets) => set(state => ({
        widgets: valueOrCallback(widgets, state.widgets)
      })),
      setLayoutMeta: (widgetMeta) => set(state => ({
        widgetMeta: valueOrCallback(widgetMeta, state.widgetMeta)
      })),
      setRows: (rows) => set(state => ({
        rows: valueOrCallback(rows, state.rows)
      })),
      setColumns: (columns) => set(state => ({
        columns: valueOrCallback(columns, state.columns)
      })),
      addOrSelectConnection: (connection) => {
        set((state) => {
          const normalized = {
            ...connection,
            name: connection.name ?? (() => {
              try {
                return new URL(connection.url).host;
              } catch {
                return connection.url;
              }
            })(),
          };

          const connections = state.connections.some(c => c.url === normalized.url)
            ? state.connections.map(c => c.url === normalized.url ? { ...c, ...normalized } : c)
            : [...state.connections, normalized];

          return {
            connections,
            selectedConnectionUrl: normalized.url,
          };
        });
      },
      selectConnection: (url) => set(() => ({
        selectedConnectionUrl: url,
      })),
      removeConnection: (url) => set((state) => ({
        connections: state.connections.filter(c => c.url !== url),
        selectedConnectionUrl: state.selectedConnectionUrl === url ? undefined : state.selectedConnectionUrl,
      }))
    })
  ),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        for (const w of state?.widgets ?? []) {
          widgetIdStore.mark(w.i);
        }
        resolveLoading();
      }
    }
  )
);