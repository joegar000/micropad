import { createIdStore } from "../../util/id";
import { valueOrCallback } from "../../util/valueorcallback";
import type { GridStoreSlice, LayoutSlice } from "./types";

export const widgetIdStore = createIdStore();

export const layoutSlice: GridStoreSlice<LayoutSlice> = (set): LayoutSlice => ({
  widgets: [],
  setLayout: (widgets) => set((state: any) => ({
    widgets: valueOrCallback(widgets, state.widgets)
  }))
});

export type { LayoutSlice };
