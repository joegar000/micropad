import type { Socket } from 'socket.io-client';
import * as Y from 'yjs';

export function sync(socket: Socket, doc: Y.Doc) {
  let lock = false;

  const applyUpdate = (update: Uint8Array | ArrayBuffer) => {
    lock = true;
    try {
      Y.applyUpdate(
        doc,
        update instanceof Uint8Array ? update : new Uint8Array(update)
      );
    } finally {
      lock = false;
    }
  };

  socket.on('connect', () => {
    socket.emit('yjs:sync', Y.encodeStateVector(doc), (update: Uint8Array | ArrayBuffer) => {
      applyUpdate(update);
    });
  });

  socket.on('yjs:update', (update: Uint8Array | ArrayBuffer) => {
    applyUpdate(update);
  });

  doc.on('update', (update) => {
    if (!lock) {
      socket.emit('yjs:update', update);
    }
  });

  return new Promise<void>((resolve, reject) => {
    socket.emit('yjs:sync', Y.encodeStateVector(doc), (update: Uint8Array | ArrayBuffer) => {
      try {
        applyUpdate(update);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}
