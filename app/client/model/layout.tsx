import { type Socket } from 'socket.io-client';
import { type Schema } from '../../server/db/db.ts';
import { createContext } from 'react';
import { useApp } from './app.tsx';
import { bridge } from 'micropad-sdk/client';

export default class LayoutModel {
  socket: Socket;
  data: Schema['layouts'];

  constructor(params: {
    socket: Socket,
    data: Schema['layouts']
  }) {
    this.socket = params.socket;
    this.data = params.data;
  }

  static async create(socket: Socket) {
    const { data } = await bridge(socket, 'db:micropad-layouts');
    return new LayoutModel({ socket, data });
  }
}

export const LayoutModelContext = createContext<LayoutModel | null>(null);

export const useLayout = () => useApp().layout;

