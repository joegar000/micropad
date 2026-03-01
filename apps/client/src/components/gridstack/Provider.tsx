import React, { createContext, useContext, useRef, useEffect } from 'react';
import { GridStack, type GridStackOptions } from 'gridstack';

type GridstackContextValue = {
  init: (container: HTMLElement, opts?: GridStackOptions) => GridStack | undefined;
  getGrid: () => GridStack | undefined;
  onReady: (cb: (g: GridStack) => void) => () => void;
};

const GridstackContext = createContext<GridstackContextValue | undefined>(undefined);

export const GridstackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gridRef = useRef<GridStack | null>(null);
  const listenersRef = useRef<Array<(g: GridStack) => void>>([]);

  const init = (container: HTMLElement, opts?: GridStackOptions) => {
    gridRef.current = GridStack.init(opts ?? {}, container);
    listenersRef.current.forEach((cb) => cb(gridRef.current!));
    listenersRef.current = [];
    return gridRef.current ?? undefined;
  };

  const getGrid = () => gridRef.current ?? undefined;

  const onReady = (cb: (g: GridStack) => void | (() => void)) => {
    const cleanup = gridRef.current ? cb(gridRef.current) : undefined;
    listenersRef.current.push(cb);
    return () => {
      cleanup?.();
      listenersRef.current = listenersRef.current.filter((c) => c !== cb);
    };
  };

  useEffect(() => {
    return () => {
      gridRef.current?.destroy(false);
      gridRef.current = null;
    };
  }, []);

  return (
    <GridstackContext.Provider value={{ init, getGrid, onReady }}>
      {children}
    </GridstackContext.Provider>
  );
};

export const useGridstackContext = () => {
  const ctx = useContext(GridstackContext);
  if (!ctx) throw new Error('useGridstackContext must be used within GridstackProvider');
  return ctx;
};
