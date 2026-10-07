import { invariant, isJSONArray, isJSONObject, limitAsync, retry } from "es-toolkit";
import { observable, runInAction } from "mobx";
import type { Socket } from "socket.io-client";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import * as jsonpatch from "fast-json-patch";

export class ClientBridge<T extends 'obj' | 'arr'> {
  private static bridges = new Map<
    Socket,
    Map<string, ClientBridge<any>>
  >();

  static async get(socket: Socket, namespace: string) {
    if (!this.bridges.get(socket)?.get(namespace)) {
      this.bridges.set(socket, this.bridges.get(socket) ?? new Map());
      this.bridges.get(socket)!.set(
        namespace, new ClientBridge(socket, namespace, 'obj')
      );
    }

    const inst = this.bridges.get(socket)!.get(namespace);
    invariant(
      inst!.type !== 'obj',
      'Cannot create an object bridge in an array bridge namespace'
    );
  }

  static async getArr(socket: Socket, namespace: string) {
    if (!this.bridges.get(socket)?.get(namespace)) {
      this.bridges.set(socket, this.bridges.get(socket) ?? new Map());
      this.bridges.get(socket)!.set(
        namespace, new ClientBridge(socket, namespace, 'arr')
      );
    }

    const inst = this.bridges.get(socket)!.get(namespace)!;
    invariant(
      inst.type !== 'arr',
      'Cannot create an array bridge in an object bridge namespace'
    );
  }

  private static async getSnapshot(socket: Socket, namespace: string) {
    return await new Promise((resolve, reject) => {
      socket.emit(`bridge:${namespace}:snapshot`, (err: unknown, snapshot: Snapshot) => {
        if (err) {
          reject(`Failed to get snapshot for namespace ${namespace}`);
        } else if (snapshot.status === 'ok') {
          resolve(snapshot);
        } else {
          reject('Invalid snapshot status');
        }
      });
    })
  }

  public readonly socket: Socket;
  public readonly namespace: string;
  public readonly data: T extends 'obj' ? Record<string, any> : any[];
  public ready: Promise<void>;
  private type: T;

  private constructor(socket: Socket, namespace: string, type: T) {
    this.socket = socket;
    this.namespace = namespace;
    this.data = observable(type === 'obj' ? {} as Record<string, any> : [] as any);
    this.type = type;
    this.reset = limitAsync(this.reset.bind(this), 1);

    this.ready = retry(this.reset, 5);

    let applyingPatches = 0;

    socket.on(`bridge:${namespace}:write`, (payload: Write) => {
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
    });
  }

  public async reset() {
    const snapshot = await ClientBridge.getSnapshot(this.socket, this.namespace);

    invariant(
      (isJSONObject(snapshot) && isJSONObject(this.data))
      || (isJSONArray(snapshot) && isJSONArray(this.data)),
      `ClientBridge data mismatch with type ${this.type}`
    );

    runInAction(() => {
      for (const key of Object.keys(this.data)) {
        delete this.data[key as keyof typeof this.data];
      }
      for (const [key, value] of Object.entries(snapshot)) {
        this.data[key as keyof typeof this.data] = value;
      }
    });
  }
}

