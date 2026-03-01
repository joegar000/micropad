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
  setLayout: (widgets: WidgetLayout[] | ((prev: WidgetLayout[]) => WidgetLayout[])) => void;
}

export const widgetIdStore = createIdStore();

export const useLayoutStore = create<LayoutState>()(
  persist(
    ((set) => ({
      widgets: [],
      setLayout: (widgets) => set((state) => {
        if (widgets instanceof Function) {
          return { widgets: widgets(state.widgets) };
        }
        return { widgets };
      })
    })),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => zustandStorage)
    }
  )
);