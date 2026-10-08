import { invariant, isJSONArray, isJSONObject } from "es-toolkit";
import { observable, reaction, runInAction, toJS } from "mobx";
import type { Socket } from "socket.io-client";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult, singleflight } from "../shared";

export class ClientBridge<T extends 'obj' | 'arr', D extends Record<string, any> | any[] = T extends 'obj' ? Record<string, any> : any[]> {
  private static bridges = new Map<
    Socket,
    Map<string, ClientBridge<any, any>>
  >();

  static async get<Data extends Record<string, any> = Record<string, any>>(socket: Socket, namespace: string): Promise<ClientBridge<'obj', Data>> {
    if (!this.bridges.get(socket)?.get(namespace)) {
      this.bridges.set(socket, this.bridges.get(socket) ?? new Map());
      this.bridges.get(socket)!.set(
        namespace, new ClientBridge(socket, namespace, 'obj')
      );
    }

    const inst = this.bridges.get(socket)!.get(namespace)!;
    invariant(
      inst.type === 'obj',
      `Cannot create an object bridge in an array bridge namespace. Received type ${inst.type}`
    );
    await inst.ready;
    return inst;
  }

  static async getArr<Data extends any[] = any[]>(socket: Socket, namespace: string): Promise<ClientBridge<'arr', Data>> {
    if (!this.bridges.get(socket)?.get(namespace)) {
      this.bridges.set(socket, this.bridges.get(socket) ?? new Map());
      this.bridges.get(socket)!.set(
        namespace, new ClientBridge(socket, namespace, 'arr')
      );
    }

    const inst = this.bridges.get(socket)!.get(namespace)!;
    invariant(
      inst.type === 'arr',
      `Cannot create an array bridge in an object bridge namespace. Received type ${inst.type}`
    );
    await inst.ready;
    return inst;
  }

  private static async getSnapshot(socket: Socket, namespace: string) {
    return await new Promise<Snapshot['body']>((resolve, reject) => {
      socket.timeout(5000).emit(`bridge:${namespace}:snapshot`, (err: unknown, snapshot: Snapshot) => {
        if (err) {
          console.error(err);
          reject(`Failed to get snapshot for namespace ${namespace}`);
        } else if (snapshot.status === 'ok') {
          resolve(snapshot.body);
        } else {
          reject('Invalid snapshot status');
        }
      });
    })
  }

  public readonly socket: Socket;
  public readonly namespace: string;
  public readonly data: D;
  public readonly ready: Promise<void>;
  private type: T;
  private cleanup?: () => void

  private constructor(socket: Socket, namespace: string, type: T) {
    this.socket = socket;
    this.namespace = namespace;
    this.data = observable(type === 'obj' ? {} as Record<string, any> : [] as any);
    this.type = type;
    this.reset = singleflight(this.reset.bind(this));

    this.ready = this.reset();

    let applyingPatches = 0;

    setInterval(() => {
      this.reset();
    }, 30000);

    this.ready.then(() => {
      const write = (payload: Write) => {
        applyingPatches++;
        try {
          runInAction(() => {
            jsonpatch.applyPatch(this.data, payload.patches);
          });
        } catch (e) {
          this.reset();
        } finally {
          applyingPatches--;
        }
      }

      socket.on(`bridge:${namespace}:write`, write);

      const disposer = reaction(
        () => toJS(this.data),
        (current, previous) => {
          if (!applyingPatches) {
            const patches = jsonpatch.compare(previous, current);
            if (!patches.length) return;
            socket.timeout(5000).emit(
              `bridge:${namespace}:write`,
              { patches } as Write,
              (err: boolean, ack: WriteResult) => {
                if (err) {
                  this.reset();
                } else if (ack.status === 'invalid') {
                  this.overwriteData(ack.body);
                }
              }
            );
          }
        }
      );

      this.cleanup = () => {
        disposer();
        socket.off(`bridge:${namespace}:write`, write);
      }
    });
  }

  private overwriteData(snapshot: Snapshot['body']) {
    runInAction(() => {
      for (const key of Object.keys(this.data)) {
        delete this.data[key as keyof typeof this.data];
      }
      for (const [key, value] of Object.entries(snapshot)) {
        this.data[key as keyof typeof this.data] = value as any;
      }
    });
  }

  public async reset() {
    const snapshot = await ClientBridge.getSnapshot(this.socket, this.namespace);

    invariant(
      (isJSONObject(snapshot) && isJSONObject(toJS(this.data)))
      || (isJSONArray(snapshot) && isJSONArray(toJS(this.data))),
      `ClientBridge data mismatch with type ${this.type}`
    );

    this.overwriteData(snapshot);
  }

  public dispose() {
    this.cleanup?.();
  }
}

