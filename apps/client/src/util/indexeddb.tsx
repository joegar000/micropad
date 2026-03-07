import { get, set, del } from 'idb-keyval';
import { type StateStorage } from 'zustand/middleware';

// Custom storage object
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const res = (await get(name)) || null;
    console.info('loaded state', { res: JSON.parse(res) })
    return res;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
