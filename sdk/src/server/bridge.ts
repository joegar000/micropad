import { observable, reaction, runInAction, toJS } from "mobx";
import type { Socket, Server } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { invariant } from "es-toolkit";
import * as Y from 'yjs';

export function sync(io: Server, doc: Y.Doc) {
  const sockets = new Set<Socket>();
  io.on('connection', socket => {
    console.info('new connection...');
    sockets.add(socket);

    socket.on('yjs:update', (update: Uint8Array) => {
      Y.applyUpdate(doc, update);
      socket.broadcast.emit('yjs:update', update);
    });

    socket.on('disconnect', () => {
      console.info('connection lost');
      sockets.delete(socket);
    });
  });

  doc.on('update', (update) => {
    sockets.forEach(socket => {
      socket.emit('yjs:update', update);
    });
  });
  return doc;
}

