import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";

export interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export interface WidgetMeta {
  [id: string]: {
    type: string;
  }
}

interface LayoutState {
  widgetMeta: WidgetMeta;
  widgets: WidgetLayout[];
  setLayout: ValueOrCallback<WidgetLayout[]>;
}

export const widgetIdStore = createIdStore();

export const useLayoutStore = create<LayoutState>()(
  // persist(
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
      setLayout: (widgets) => set(state => ({
        widgets: valueOrCallback(widgets, state.widgets)
      }))
    })
  // ),
    // {
    //   name: "layout-storage",
    //   storage: createJSONStorage(() => zustandStorage),
    //   onRehydrateStorage: () => (state) => {
    //     for (const w of state?.widgets ?? []) {
    //       widgetIdStore.mark(w.id);
    //     }
    //   }
    // }
  )
);