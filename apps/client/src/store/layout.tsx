import { create } from "zustand";
import { createIdStore } from "../util/id";

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

export const useLayoutStore = create<LayoutState>((set) => ({
  widgets: [
    // { type: "button", x: 6, y: 0, w: 3, h: 3, id: widgetIdStore.generate() },
    { type: "dial", x: 0, y: 0, w: 3, h: 2, id: widgetIdStore.generate() },
    // { type: "clock", x: 0, y: 0, w: 1, h: 1, id: widgetIdStore.generate() },
    // { type: "volume", x: 1, y: 0, w: 1, h: 1, id: widgetIdStore.generate() },
  ],

  setLayout: (widgets) => set({ widgets }),

  updateWidget: (updated) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === updated.id ? updated : w
      ),
    })),
}));