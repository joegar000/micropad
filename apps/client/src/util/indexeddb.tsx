import { get, set, del } from 'idb-keyval'; // can use anything: IndexedDB, Ionic Storage, etc.
import { type StateStorage } from 'zustand/middleware';

// Custom storage object
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.info(name, 'has been retrieved');
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.info(name, 'with value', value, 'has been saved');
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.info(name, 'has been deleted');
    await del(name);
  },
};
