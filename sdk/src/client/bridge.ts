import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";
import { Protocol, type Snapshot, type Write } from "../shared/bridge/protocol";
import { v4 as uuid } from "uuid";


export function createBridgeGenerator(socket: Socket) {
  const socketCache = new Map<string, Set<Socket>>();
  let applyingRemote = 0;

  class Bridge {
    static cache = new Map<string, Bridge>();
    readonly observable: Record<string, any>;
    readonly writeQueue: Write[];
    readonly namespace: string
    revision: number;

    private constructor(namespace: string) {
      this.namespace = namespace;
      this.observable = observable({});
      this.writeQueue = [];
      this.revision = 0;
    }

    resync() {
      const snapshot: Snapshot = await new Promise((resolve, reject) => {
        socket.emit(`bridge:${this.namespace}:snapshot`, (snapshot: Snapshot) => {
          if (snapshot.status === 'ok') {
            resolve(snapshot);
          } else {
            reject(`Failed to get snapshot for namespace ${this.namespace}`);
          }
        });
      });
      runInAction(() => {
        for (const key of Object.keys(this.observable)) {
          delete this.observable[key];
        }
        for (const [key, value] of Object.entries(snapshot)) {
          this.observable[key] = value;
        }
      });
      this.revision = snapshot.revision;
    }

    write(patches: jsonpatch.Operation[]) {
      const nextRevision = this.writeQueue.at(-1).baseRevision + 1;
      this.writeQueue.push({ id: uuid(), baseRevision: nextRevision, patches });
      socket.timeout(10000).emit(
        `bridge:${this.namespace}:write`,
        this.writeQueue.at(-1)
      ),
      (err: boolean, res: WriteResult) => {
        if (err) {
          // some sort of rollback
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

  return async function getBridge(namespace: string): Promise<Record<string, any>> {
    if (!socketCache.has(namespace)) {
      socketCache.set(namespace, new Set());
    }
    if (socketCache.get(namespace)!.has(socket)) {
      return Bridge.get(namespace).observable;
    }
    socketCache.get(namespace)!.add(socket);

    const bridge: Bridge = Bridge.get(namespace);

    async function sendWrite(payload: Write) {
      bridge.writeQueue.push(payload);
    }

    socket.on('connect', () => setSnapshot());

    reaction(
      () => toJS(bridge.observable),
      (current, previous) => {
        if (applyingRemote) return;

        const patches = jsonpatch.compare(previous, current);
        if (patches.length) {
          socket.timeout(10000).emit(
            `bridge:${namespace}:write`,
            Protocol.write({
              id: 'hi',
              baseRevision: observableRevision.get(namespace),
              patches
            }),
            (err, res) => {
              // some sort of rollback
            }
          );
        }
      }
    );
    socket.on(`bridge:${namespace}:write`, (payload: Write) => {
      applyingRemote++;
      try {
        runInAction(() => {
          jsonpatch.applyPatch(obj, payload.patches, true, true);
        });
        observableRevision.set(namespace, payload.baseRevision);
      } finally {
        applyingRemote--;
      }
    });

    return await observableCache.get(namespace)!;
  }
}

