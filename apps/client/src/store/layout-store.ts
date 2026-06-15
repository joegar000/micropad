import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../lib/indexeddb-storage";
import type { LayoutItem } from "react-grid-layout";
import { createContext } from "react";
import {
  createDefaultLayout,
  nowIso,
  type MicropadLayout,
  type WidgetInstance
} from "micropad-protocol";
import { createIdStore } from "../lib/id-store";
import { applyLayoutItemsToWidgets } from "./layout-model";

export interface LayoutStoreState {
  layout: MicropadLayout;
  bridgeReady: boolean;
  currentPage: MicropadLayout['pages'][number];
  setLayoutFromBridge: (layout: MicropadLayout) => void;
  markBridgeReady: () => void;
  setCurrentPage: (pageId: string) => void;
  setRows: (rows: number) => void;
  setColumns: (cols: number) => void;
  setWidgetPlacements: (widgets: LayoutItem[]) => void;
  addWidget: (widget: WidgetInstance) => void;
  removeWidget: (widgetId: string) => void;
  setWidgetConfig: (widgetId: string, config: WidgetInstance["config"]) => void;
}

export const widgetIdStore = createIdStore();

let resolveLoading: () => void;
export const layoutLoad = new Promise<void>(resolve => {
  resolveLoading = resolve;
});

const defaultLayout = createDefaultLayout({
  layoutId: "layout-local-default",
  pageId: "page-main",
  rows: 3,
  columns: 5
});

function touch(layout: MicropadLayout) {
  layout.updatedAt = nowIso();
}

function markWidgetIds(layout: MicropadLayout) {
  for (const page of layout.pages) {
    for (const widget of page.widgets) {
      widgetIdStore.mark(widget.id);
    }
  }
}

export const useLayoutStore = create<LayoutStoreState>()(
  persist(
    immer(
      (set, get) => ({
        layout: defaultLayout,
        bridgeReady: false,
        currentPage: get()?.layout.pages.find(page => page.id === get().layout.currentPageId) ?? defaultLayout.pages[0],
        setLayoutFromBridge: layout => {
          markWidgetIds(layout);
          set(s => {
            s.layout = layout;
            s.bridgeReady = true;
          });
        },
        markBridgeReady: () => {
          set(s => {
            s.bridgeReady = true;
          });
        },
        setCurrentPage: pageId => {
          set(s => {
            if (s.layout.pages.some(page => page.id === pageId)) {
              s.layout.currentPageId = pageId;
              touch(s.layout);
            }
          });
        },
        setRows: rows => {
          set(s => {
            s.currentPage.rows = rows;
            touch(s.layout);
          });
        },
        setColumns: cols => {
          set(s => {
            s.currentPage.columns = cols;
            touch(s.layout);
          });
        },
        setWidgetPlacements: widgets => {
          set(s => {
            s.currentPage.widgets = applyLayoutItemsToWidgets(s.currentPage.widgets, widgets);
            touch(s.layout);
          });
        },
        addWidget: widget => {
          widgetIdStore.mark(widget.id);
          set(s => {
            s.currentPage.widgets.push(widget);
            touch(s.layout);
          });
        },
        removeWidget: widgetId => {
          set(s => {
            s.currentPage.widgets = s.currentPage.widgets.filter(widget => widget.id !== widgetId);
            touch(s.layout);
          });
        },
        setWidgetConfig: (widgetId, config) => {
          set(s => {
            const widget = s.currentPage.widgets.find(candidate => candidate.id === widgetId);
            if (widget) {
              widget.config = config;
              touch(s.layout);
            }
          });
        }
      })
    ),
    {
      name: "layout-storage-v2",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => state => {
        if (state?.layout) {
          markWidgetIds(state.layout);
        }
        resolveLoading();
      }
    }
  )
);

export const GridsContext = createContext<LayoutStoreState | null>(null);

export const useGrids = useLayoutStore;
