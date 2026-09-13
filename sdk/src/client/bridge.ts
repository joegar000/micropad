import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { Mutex } from "es-toolkit";
import { memoize } from "es-toolkit/function";

export const createBridgeGenerator = memoize((namespace: string) => {
  const socketFnCache = new Map<Socket, any>();
  return memoize(async function (socket: Socket) {
    socket = socket.timeout(5000);

    const obs: Record<string, any> = observable({});
    let applyingPatches = 0;

    function overwriteObs(newObs: Record<string, any>) {
      applyingPatches++;
      try {
        runInAction(() => {
          for (const key of Object.keys(obs)) {
            delete obs[key];
          }
          for (const [key, value] of Object.entries(newObs)) {
            obs[key] = value;
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
        sync();
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

    const disposer = reaction(
      () => toJS(obs),
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

    await sync();

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

