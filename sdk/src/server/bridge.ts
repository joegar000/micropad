import type { Socket, Server } from 'socket.io';
import * as Y from 'yjs';

export function sync(io: Server, doc: Y.Doc) {
  const sockets = new Set<Socket>();
  let lock = false;
  io.on('connection', socket => {
    console.info('new connection...');
    sockets.add(socket);

    socket.on('yjs:sync', (vector: Uint8Array | ArrayBuffer, ack: (update: Uint8Array) => void) => {
      console.info('sync requested')
      ack(Y.encodeStateAsUpdate(
        doc,
        vector instanceof Uint8Array ? vector : new Uint8Array(vector)
      ));
    });

    socket.on('yjs:update', (update: Uint8Array | ArrayBuffer) => {
      lock = true;
      try {
        Y.applyUpdate(
          doc,
          update instanceof Uint8Array ? update : new Uint8Array(update)
        );
        socket.broadcast.emit('yjs:update', update);
      } finally {
        lock = false;
      }
    });

    socket.on('disconnect', () => {
      console.info('connection lost');
      sockets.delete(socket);
    });
  });

  doc.on('update', (update) => {
    if (!lock) {
      sockets.forEach(socket => {
        socket.emit('yjs:update', update);
      });
    }
  });
  return doc;
}
