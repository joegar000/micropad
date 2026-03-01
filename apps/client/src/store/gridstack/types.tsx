import type { GridStack, GridStackDroppedHandler, GridStackElementHandler, GridStackEventHandler, GridStackEventHandlerCallback, GridStackNodesHandler, GridStackOptions } from "gridstack";
import type { ValueOrCallback } from "../../util/valueorcallback";
import type { StateCreator } from "zustand";

export type WidgetLayout = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
};

export interface LayoutSlice {
  widgets: WidgetLayout[];
  setLayout: ValueOrCallback<WidgetLayout[]>;
}

export interface GridSlice {
  gridstack: GridStack | null;
  init: (container: HTMLElement, opts?: GridStackOptions) => GridStack;
  destroy: () => void;
  addWidget: (w: Omit<WidgetLayout, 'id'> & Partial<WidgetLayout>) => string;
  removeWidget: (id: string) => void;
  on(name: 'dropped', callback: GridStackDroppedHandler): () => void;
  on(name: 'enable' | 'disable', callback: GridStackEventHandler): () => void;
  on(name: 'change' | 'added' | 'removed' | 'resizecontent', callback: GridStackNodesHandler): () => void;
  on(name: 'resizestart' | 'resize' | 'resizestop' | 'dragstart' | 'drag' | 'dragstop', callback: GridStackElementHandler): () => void;
  on(name: string, callback: GridStackEventHandlerCallback): () => void;
  onReady: (cb: (g: GridStack) => void) => void;
}

export type GridStore = LayoutSlice & GridSlice;

export type GridStoreSlice<T> = StateCreator<
  GridStore,
  [],
  [],
  T
>;
