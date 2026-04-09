import { create } from "zustand";
import type { Grid, WidgetMeta } from "./types";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../../util/indexeddb";
import type { LayoutItem } from "react-grid-layout";
import { createContext } from "react";

interface GridState {
  grids: Grid[];
  setRows: (rows: number, gIndex: number) => void;
  setColumns: (cols: number, gIndex: number) => void;
  setLayout: (widgets: LayoutItem[], gIndex: number) => void;
  setLayoutMeta: (meta: WidgetMeta, gIndex: number) => void;
  addGrid: (grid: Grid, atIndex?: number) => void;
  setGrids: (grids: Grid[]) => void;
  removeGrid: (atIndex: number) => void;
}

export const useGrids = create<GridState>()(
  persist(
    immer(
      ((set, _get) => ({
        grids: [],
        setRows: (rows, gIndex) => {
          set(s => {
            s.grids[gIndex].rows = rows;
          })
        },
        setColumns: (cols: number, gIndex: number) => {
          set(s => {
            s.grids[gIndex].columns = cols;
          })
        },
        setLayout: (widgets, gIndex) => {
          set(s => {
            s.grids[gIndex].widgets = widgets;
          });
        },
        setLayoutMeta: (meta, gIndex) => {
          set(s => {
            // @ts-ignore
            s.grids[gIndex].meta = meta;
          });
        },
        addGrid: (grid, atIndex) => {
          set(s => {
            if (atIndex === undefined)
              s.grids.push(grid);
            else
              s.grids.splice(atIndex, 0, grid);
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
