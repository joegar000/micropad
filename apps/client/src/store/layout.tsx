import { create } from "zustand";
import { createIdStore } from "../util/id";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../util/indexeddb";

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
  setLayout: (widgets: WidgetLayout[]) => void;
  updateWidget: (widget: WidgetLayout) => void;
}

export const widgetIdStore = createIdStore();

export const useLayoutStore = create<LayoutState>()(
  persist(
    ((set) => ({
      widgets: [],

      setLayout: (widgets) => set({ widgets }),

      updateWidget: (updated) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === updated.id ? updated : w
          ),
        })),
    })),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => zustandStorage)
    }
  )
);