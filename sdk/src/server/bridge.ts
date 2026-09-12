import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { v4 as uuid } from "uuid";
import { memoize } from "es-toolkit/function";


const observableCache = new Map<string, Record<string, any>>();
const revisionCache = new Map<string, number>();
const _createBridgeGenerator = memoize(function _createBridgeGenerator(socket: Socket) {
  class Bridge {
    static cache = new Map<string, Bridge>();
    readonly namespace: string;
    private applyingPatches: number = 0;

    private constructor(namespace: string) {
      if (!observableCache.has(namespace)) {
        observableCache.set(namespace, observable({}));
      }
      this.namespace = namespace;

      socket.on(`bridge:${this.namespace}:snapshot`, (ack) => {
        ack({
          status: 'ok',
          revision: this.revision,
          body: toJS(this.observable)
        } as Snapshot);
      });

      socket.on(`bridge:${namespace}:write`, (payload: Write, ack) => {
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
          ack({
            status: 'ok',
            revision: this.revision
          } as WriteResult);
        } else {
          ack({
            status: 'conflict',
            revision: this.revision,
            body: toJS(this.observable)
          } as WriteResult);
        }
      });

      reaction(
        () => toJS(this.observable),
        (current, previous) => {
          if (!this.applyingPatches) {
            const patches = jsonpatch.compare(previous, current);
            if (!patches.length) return;
            socket.emit(
              `bridge:${this.namespace}:write`,
              {
                id: uuid(),
                patches,
                baseRevision: this.revision
              } as Write
            );
          }
        }
      );
    }

    get observable() {
      if (!observableCache.has(this.namespace))
        observableCache.set(this.namespace, observable({}));
      return observableCache.get(this.namespace)!;
    }

    get revision() {
      if (!revisionCache.has(this.namespace))
        revisionCache.set(this.namespace, 0);
      return revisionCache.get(this.namespace)!;
    }

    set revision(value: number) {
      revisionCache.set(this.namespace, value);
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

