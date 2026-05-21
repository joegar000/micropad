import { create } from "zustand";
import type { Grid, WidgetMeta } from "./types";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../../util/indexeddb";
import type { LayoutItem } from "react-grid-layout";
import { createContext } from "react";

interface GridState {
  grids: Grid[];
  currentGrid: Grid;
  currentIndex: number;
  setRows: (rows: number, gIndex?: number) => void;
  setColumns: (cols: number, gIndex?: number) => void;
  setLayout: (widgets: LayoutItem[], gIndex?: number) => void;
  setLayoutMeta: (meta: WidgetMeta, gIndex?: number) => void;
  addGrid: (grid: Grid, gIndex?: number) => void;
  setGrids: (grids: Grid[]) => void;
  removeGrid: (atIndex: number) => void;
}

export const useGrids = create<GridState>()(
  persist(
    immer(
      ((set, get) => ({
        grids: [{ rows: 0, columns: 0, widgets: [], meta: {} }],
        currentGrid: { rows: 0, columns: 0, widgets: [], meta: {} },
        currentIndex: 0,
        setRows: (rows: number, gIndex?: number) => {
          const index = gIndex ?? get().currentIndex;
          set(s => {
            s.grids[index].rows = rows;
          })
        },
        setColumns: (cols: number, gIndex?: number) => {
          const index = gIndex ?? get().currentIndex;
          set(s => {
            s.grids[index].columns = cols;
          })
        },
        setLayout: (widgets, gIndex?: number) => {
          const index = gIndex ?? get().currentIndex;
          set(s => {
            s.grids[index].widgets = widgets;
          });
        },
        setLayoutMeta: (meta, gIndex?: number) => {
          const index = gIndex ?? get().currentIndex;
          set(s => {
            // @ts-ignore
            s.grids[index].meta = meta;
          });
        },
        addGrid: (grid, gIndex?: number) => {
          const index = gIndex ?? get().currentIndex;
          set(s => {
            if (index === undefined)
              s.grids.push(grid);
            else
              s.grids.splice(index, 0, grid);
          })
        },
        setGrids: (grids) => {
          set(s => {
            s.grids = grids;
          })
        },
        removeGrid: (atIndex) => {
          set(s => {
            s.grids.splice(atIndex, 1);
          });
        }
      }))
    ),
    {
      name: 'grids',
      storage: createJSONStorage(() => zustandStorage)
    }
  )
);

export const GridsContext = createContext<GridState | null>(null);
