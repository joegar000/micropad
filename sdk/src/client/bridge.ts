import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { v4 as uuid } from "uuid";
import { Mutex } from "es-toolkit";
import { memoize } from "es-toolkit/function";


const observableCache = new Map<string, Record<string, any>>();
const _createBridgeGenerator = memoize(function _createBridgeGenerator(socket: Socket) {
  class Bridge {
    static cache = new Map<string, Bridge>();
    readonly writeQueue: Write[] = [];
    readonly namespace: string;
    private revision: number = 0;
    private applyingPatches: number = 0;
    private resyncMutex: Mutex = new Mutex();

    private constructor(namespace: string) {
      this.namespace = namespace;

      socket.on('connect', () => this.resync());

      socket.on(`bridge:${namespace}:write`, (payload: Write) => {
        if (this.revision === payload.baseRevision) {
          this.applyingPatches++;
          try {
            runInAction(() => {
              jsonpatch.applyPatch(this.observable, payload.patches);
            });
            this.revision = payload.baseRevision + 1;
          } finally {
            this.applyingPatches--;
          }
        } else {
          this.resync();
        }
      });

      reaction(
        () => toJS(this.observable),
        (current, previous) => {
          if (!this.applyingPatches)
            this.write(jsonpatch.compare(previous, current));
        }
      );

      this.resync();
    }

    get observable() {
      if (!observableCache.has(this.namespace))
        observableCache.set(this.namespace, observable({}));
      return observableCache.get(this.namespace)!;
    }

    async resync() {
      if (this.resyncMutex.isLocked) return;
      await this.resyncMutex.acquire();
      try {
        const snapshot: Snapshot = await new Promise((resolve, reject) => {
          socket.timeout(10000).emit(`bridge:${this.namespace}:snapshot`, (err, snapshot: Snapshot) => {
            if (err) {
              reject(`Failed to get snapshot for namespace ${this.namespace}`);
            } else if (snapshot.status === 'ok') {
              resolve(snapshot);
            }
          });
        });
        this.applyingPatches++;
        runInAction(() => {
          for (const key of Object.keys(this.observable)) {
            delete this.observable[key];
          }
          for (const [key, value] of Object.entries(snapshot.body)) {
            this.observable[key] = value;
          }
        });
        this.applyingPatches--;
        this.revision = snapshot.revision;
        while (this.writeQueue.length) this.writeQueue.pop();
      } catch(e) {
        this.resync();
      } finally {
        this.resyncMutex.release();
      }
    }

    write(patches: jsonpatch.Operation[]) {
      if (!patches.length) return;
      const id = uuid();
      this.writeQueue.push({
        id,
        patches,
        baseRevision: (
          this.writeQueue.length ?
            this.writeQueue.at(-1)!.baseRevision + 1 :
            this.revision
        )
      });
      socket.timeout(10000).emit(
        `bridge:${this.namespace}:write`,
        this.writeQueue.at(-1),
        (err: boolean, ack: WriteResult) => {
          if (err || ack.status === 'conflict' || ack.status === 'invalid') {
            this.resync();
          } else if (ack.status === 'ok' && ack.revision === this.revision + 1) {
            this.revision = ack.revision;
            this.writeQueue.splice(
              this.writeQueue.findIndex(w => w.id === id),
              1
            );
          }
        }
      );
    }

    static get(namespace: string) {
      if (!this.cache.has(namespace))
        this.cache.set(namespace, new Bridge(namespace));
      return this.cache.get(namespace)!;
    }
  }

  return function getBridge(namespace: string): Record<string, any> {
    return Bridge.get(namespace).observable!;
  }
}, { getCacheKey: x => x });


export function createBridgeGenerator(socket: Socket) {
  return _createBridgeGenerator(socket);
}

