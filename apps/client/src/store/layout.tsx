import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";
import { valueOrCallback, type ValueOrCallback } from "../util/valueorcallback";

export type WidgetLayout = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
};

interface LayoutState {
  widgets: WidgetLayout[];
  setLayout: ValueOrCallback<WidgetLayout[]>;
}

export const widgetIdStore = createIdStore();

export const useLayoutStore = create<LayoutState>()(
  persist(
    ((set) => ({
      widgets: [],
      setLayout: (widgets) => set(state => ({
        widgets: valueOrCallback(widgets, state.widgets)
      }))
    })),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        for (const w of state?.widgets ?? []) {
          widgetIdStore.mark(w.id);
        }
      }
    }
  )
);
