import { GridStack, type GridStackOptions } from 'gridstack';
import { widgetIdStore } from './layout';
import type { GridSlice, GridStoreSlice, WidgetLayout } from './types';

const gridEvents = 'dropped enable disable change added removed resizecontent resizestart resize resizestop dragstart drag dragstop'.split(' ');

export const gridSlice: GridStoreSlice<GridSlice> = (set, get) : GridSlice => {
  let readyCallbacks: Array<(g: GridStack) => void> = [];
  let eventHandlers: Record<string, Set<Function>> = {};

  return {
    gridstack: null,
    init: (container: HTMLElement, opts: GridStackOptions = {}) => {
      const gridstack = GridStack.init(opts, container);
      set(() => {
        for (const event of gridEvents) {
          gridstack.on(event, (...args: any[]) => {
            eventHandlers[event]?.forEach(cb => {
              cb(...args);
            });
          });
        }
        while (readyCallbacks.length) {
          readyCallbacks.pop()?.(gridstack);
        }
        return { gridstack };
      });
      return gridstack;
    },

    destroy: () => {
      readyCallbacks = [];
      eventHandlers = {};
      get().gridstack?.destroy(false);
    },

    addWidget: (w) => {
      const id = (w as any).id ?? widgetIdStore.generate();
      get().setLayout((prev: WidgetLayout[]) => {
        return [...prev, { ...(w as any), id }];
      });
      return id;
    },

    removeWidget: (id: string) => {
      const grid = get().gridstack;
      if (grid && typeof grid.getGridItems === 'function') {
        try {
          const widget = grid.getGridItems().find((i: any) => i.gridstackNode?.id === id || i.el?.dataset?.gsId === id);
          if (widget) {
            grid.removeWidget(widget, false);
          }
        } catch (_) {}
      }
      get().setLayout((prev: WidgetLayout[]) => prev.filter(p => p.id !== id));
    },

    on: (eventName, cb) => {
      if (!eventHandlers[eventName]) {
        eventHandlers[eventName] = new Set();
      }
      eventHandlers[eventName].add(cb);
      return () => {
        eventHandlers[eventName].delete(cb);
      };
    },

    onReady: (cb) => {
      const grid = get().gridstack;
      if (grid) {
        const cleanup = cb(grid);
        return () => {
          cleanup?.();
        };
      };
      const index = readyCallbacks.push(cb);
      return () => {
        readyCallbacks.splice(index, 1);
      }
    }
  };
};
