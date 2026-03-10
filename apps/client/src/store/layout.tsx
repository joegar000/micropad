import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";
import type { LayoutItem } from "react-grid-layout";

export interface WidgetMeta {
  [id: string]: {
    type: string;
  }
}

interface LayoutState {
  widgetMeta: WidgetMeta;
  widgets: LayoutItem[];
  rows: number;
  columns: number;
  setRows: ValueOrCallback<number>;
  setColumns: ValueOrCallback<number>;
  setLayout: ValueOrCallback<LayoutItem[]>;
  setLayoutMeta: ValueOrCallback<WidgetMeta>;
}

export const widgetIdStore = createIdStore();

let resolveLoading: () => void;
export const layoutLoad = new Promise<void>(resolve => {
  resolveLoading = resolve;
});

export const useLayoutStore = create<LayoutState>()(
  persist(
    ((set) => ({
      widgetMeta: {
        '1': { type: 'slider' },
        '2': { type: 'button' },
        '3': { type: 'dial' },
      },
      widgets: [],
      rows: 2,
      setRows: (rows) => set(state => ({
        rows: valueOrCallback(rows, state.rows)
      })),
      columns: 3,
      setColumns: (columns) => set(state => ({
        columns: valueOrCallback(columns, state.columns)
      })),
      setLayout: (widgets) => set(state => ({
        widgets: valueOrCallback(widgets, state.widgets)
      })),
      setLayoutMeta: (widgetMeta) => set(state => ({
        widgetMeta: valueOrCallback(widgetMeta, state.widgetMeta)
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