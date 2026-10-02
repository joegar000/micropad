import { type Socket } from 'socket.io-client';
import { type Schema } from '../../server/db/db.ts';
import { createContext, useContext } from 'react';
import { useApp } from './app.tsx';
import { bridge } from 'micropad-sdk/client';
import { makeObservable, observable } from 'mobx';

export function pageHelpers(page: Schema['layouts'][string][number]) {
  return {
    cellAvailable(x: number, y: number) {
      for (const w of page.widgets) {
        const startX = w.x;
        const endX = w.x + w.w - 1;
        const startY = w.y;
        const endY = w.y + w.h - 1;
        if (startX <= x && x <= endX && startY <= y && endY <= y)
          return false;
      }
      return true;
    },
    widgetAt(x: number, y: number) {
      for (const w of page.widgets) {
        if (w.x === x && w.y === y)
          return w;
      }
      return null;
    }
  }
}

export default class LayoutModel {
  socket: Socket;
  data: Schema['layouts'];
  cellHeight: number = 0;
  gridHeight: number = 0;
  gridWidth: number = 0;

  constructor(params: {
    socket: Socket,
    data: Schema['layouts']
  }) {
    this.socket = params.socket;
    this.data = params.data;

    makeObservable(this, {
      cellHeight: observable,
      gridHeight: observable,
      gridWidth: observable
    });
  }

  static async create(socket: Socket) {
    const { data } = await bridge(socket, 'db:micropad-layouts');
    return new LayoutModel({ socket, data });
  }
}

export const LayoutModelContext = createContext<LayoutModel | null>(null);

export const useLayout = () => useApp().layout;

export const PageModelContext = createContext<Schema['layouts'][string][number] | null>(null);

export const usePage = () => {
  const page = useContext(PageModelContext);
  if (!page)
    throw Error('`usePage()` called outside of `PageModelContext');
  return page;
}
