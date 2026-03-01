export function createIdStore() {
  const store = new Set<string>();
  return {
    generate: () => {
      let id = Math.random().toString(36).substring(2, 15);
      while (store.has(id)) {
        id = Math.random().toString(36).substring(2, 15);
      }
      store.add(id);
      return id;
    },
    remove: (id: string) => {
      store.delete(id);
    },
    mark: (id: string) => {
      store.add(id);
    },
  };
}

export const globalIdStore = createIdStore();