import { create } from "zustand";
import { GridStack, type GridStackOptions } from 'gridstack';

interface GridStackState {
  gridstack: GridStack | null;
  init: (container: HTMLElement, opts?: GridStackOptions) => void;
}

export const useGridStack = create<GridStackState>()((set, get) => ({
  gridstack: null,
  init: (container: HTMLElement, opts: GridStackOptions = {}) => set(state => {
    const gridstack = GridStack.init(
      opts, container
    );
    return { gridstack };
  }),
  onReady: (cb: (g: GridStack) => void) => set(state => {
  })
}));