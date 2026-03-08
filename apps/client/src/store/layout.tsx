import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";
import type { GridStackNode } from "gridstack";

export interface WidgetMeta {
  [id: string]: {
    type: string;
  }
}

export type SanitizedGridStackNode = {
  h: NonNullable<GridStackNode['h']>,
  w: NonNullable<GridStackNode['w']>,
  x: NonNullable<GridStackNode['x']>,
  y: NonNullable<GridStackNode['y']>,
  id: NonNullable<GridStackNode['id']>
}

interface LayoutState {
  widgetMeta: WidgetMeta;
  widgets: GridStackNode[];
  rows: number;
  columns: number;
  setRows: ValueOrCallback<number>;
  setColumns: ValueOrCallback<number>;
  setLayout: ValueOrCallback<GridStackNode[]>;
  setLayoutMeta: ValueOrCallback<WidgetMeta>;
}

export const widgetIdStore = createIdStore();

function sanitizeWidgets(widgets: GridStackNode[]): SanitizedGridStackNode[] {
  return widgets.map(w => ({
    id: w.id!,
    h: w.h!,
    w: w.w!,
    x: w.x!,
    y: w.y!
  }));
}

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
      widgets: [
        { x: 0, y: 0, w: 1, h: 1, id: '1' },
        { x: 0, y: 1, w: 2, h: 1, id: '2' },
        { x: 2, y: 0, w: 1, h: 2, id: '3' },
      ],
      rows: 2,
      setRows: (rows) => set(state => ({
        rows: valueOrCallback(rows, state.rows)
      })),
      columns: 3,
      setColumns: (columns) => set(state => ({
        columns: valueOrCallback(columns, state.columns)
      })),
      setLayout: (widgets) => set(state => ({
        widgets: sanitizeWidgets(valueOrCallback(widgets, state.widgets))
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
          widgetIdStore.mark(w.id!);
        }
        resolveLoading();
      }
    }
  )
);