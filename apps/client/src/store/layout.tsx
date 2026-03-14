import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";
import type { LayoutItem } from "react-grid-layout";
import type { WidgetSpec } from "../components/grid";

export interface WidgetMeta {
  [id: string]: Pick<WidgetSpec<string>, 'type'>;
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
      widgets: [],
      widgetMeta: {},
      rows: 2,
      columns: 3,
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