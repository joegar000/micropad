import { observable, reaction, runInAction, toJS } from "mobx";
import type { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { Mutex } from "es-toolkit";
import { memoize } from "es-toolkit/function";

type BridgeObject = Record<string, any> | Array<any>;

export const getNamespaceDescriptor = memoize(<O extends BridgeObject>(namespace: string) => {
  const socketFnCache = new Map<Socket, any>();
  return memoize(async function (socket: Socket) {
    socket = socket.timeout(5000);

    let obs: O | undefined;
    let applyingPatches = 0;

    function overwriteObs(newObs: Record<string, any>) {
      applyingPatches++;
      try {
        runInAction(() => {
          if (!obs) {
            obs = observable(newObs) as O;
            return;
          };
          for (const key of Object.keys(obs)) {
            delete obs[key as keyof O];
          }
          for (const [key, value] of Object.entries(newObs)) {
            obs[key as keyof O] = value;
          }
        });
      } finally {
        applyingPatches--;
      }
    }

    const syncMutex = new Mutex();
    async function sync() {
      if (syncMutex.isLocked) {
        await syncMutex.acquire();
        syncMutex.release();
        return;
      }
      let retry = false;
      await syncMutex.acquire();
      try {
        const snapshot: Snapshot = await new Promise((resolve, reject) => {
          socket.emit(`bridge:${namespace}:snapshot`, (err: unknown, snapshot: Snapshot) => {
            if (err) {
              reject(`Failed to get snapshot for namespace ${namespace}`);
            } else if (snapshot.status === 'ok') {
              resolve(snapshot);
            } else {
              reject('Invalid snapshot status');
            }
          });
        });
        overwriteObs(snapshot.body);
      } catch(e) {
        retry = true;
      } finally {
        syncMutex.release();
      }
      if (retry) {
        console.log('retrying sync...')
        await sync();
      }
    }

    socket.on(`bridge:${namespace}:write`, (payload: Write) => {
      applyingPatches++;
      try {
        runInAction(() => {
          jsonpatch.applyPatch(obs, payload.patches);
        });
      } catch (e) {
        sync();
      } finally {
        applyingPatches--;
      }
    });

    await sync();

    const disposer = reaction(
      () => toJS(obs!),
      (current, previous) => {
        if (!applyingPatches) {
          const patches = jsonpatch.compare(previous, current);
          if (!patches.length) return;
          socket.emit(
            `bridge:${namespace}:write`,
            { patches } as Write,
            (err: boolean, ack: WriteResult) => {
              if (err) {
                sync();
              } else if (ack.status === 'invalid') {
                overwriteObs(ack.body);
              }
            }
          );
        }
      }
    );

    const intervalId = setInterval(() => sync(), 30000);

    return {
      observable: obs,
      detach: () => {
        socket.removeAllListeners(`bridge:${namespace}:write`);
        disposer();
        clearInterval(intervalId);
        socketFnCache.delete(socket);
      }
    };
  }, { cache: socketFnCache });
});

export async function bridge<D extends BridgeObject>(socket: Socket, namespace: string) {
  const desc = await getNamespaceDescriptor<D>(namespace)(socket);
  return {
    get data(): D {
      return desc.observable as D;
    },
    get detach() {
      return desc.detach
    }
  }
}

