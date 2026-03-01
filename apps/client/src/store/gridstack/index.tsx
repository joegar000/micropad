import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../../util/indexeddb';
import { layoutSlice, widgetIdStore } from './layout';
import { gridSlice } from './gridstack';
import type { GridStore } from './types';

export const useGridStore = create<GridStore>()((
  persist(
    (...a) => ({
      ...layoutSlice(...a),
      ...gridSlice(...a)
    }),
    {
      name: 'layout-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: s => ({ widgets: s.widgets }),
      onRehydrateStorage: () => (state) => {
        for (const w of state?.widgets ?? []) {
          widgetIdStore.mark(w.id);
        }
      }
    }
  )
));

export default useGridStore;

export { widgetIdStore } from './layout';