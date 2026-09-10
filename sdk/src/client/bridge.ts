import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";


export function createBridgeGenerator(socket: Socket) {
  const observableCache = new Map<string, Promise<Record<string, any>>>();
  const socketCache = new Map<string, Set<Socket>>();
  let applyingRemote = 0;

  return async function bridge(namespace: string): Promise<Record<string, any>> {
    if (!observableCache.has(namespace)) {
      const objPromise = new Promise<Record<string, any>>((resolve, _reject) => {
        socket.emit(`${namespace}:get`, (ack: Record<string, any>) => {
          resolve(observable(ack));
        });
      });
      observableCache.set(namespace, objPromise);
    }

    if (!socketCache.has(namespace)) {
      socketCache.set(namespace, new Set());
    }
    if (!socketCache.get(namespace)!.has(socket)) {
      socketCache.get(namespace)!.add(socket);
      const obj = await observableCache.get(namespace)!;
      reaction(
        () => toJS(obj),
        (current, previous) => {
          if (applyingRemote) return;

          const patches = jsonpatch.compare(previous, current);
          if (patches.length) {
            socket.timeout(5000).volatile.emit(
              `${namespace}:post`,
              patches,
              (err, res) => {
                // some sort of rollback
              }
            );
          }
        }
      );
      socket.on(`${namespace}:post`, (patches) => {
        applyingRemote++;
        try {
          runInAction(() => {
            jsonpatch.applyPatch(obj, patches, true, true);
          });
        } finally {
          applyingRemote--;
        }
      });
    }
    return await observableCache.get(namespace)!;
  }
}

