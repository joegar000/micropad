import { observable, reaction, runInAction, toJS } from "mobx";
import type { Socket } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { invariant } from "es-toolkit";

export class ServerBridge<T extends 'obj' | 'arr', D extends Record<string, any> | any[] = T extends 'obj' ? Record<string, any> : any[]> {
  private static bridges = new Map<string, ServerBridge<any>>();

  static get<Data extends Record<string, any> = Record<string, any>>(namespace: string): ServerBridge<'obj', Data> {
    if (!this.bridges.has(namespace))
      this.bridges.set(namespace, new ServerBridge(namespace, 'obj'));
    const inst = this.bridges.get(namespace)!;
    invariant(
      inst.type === 'obj',
      `Cannot create an object bridge in an array bridge namespace. Received type ${inst.type}`
    );
    return inst as ServerBridge<'obj', Data>;
  }

  static getArr<Data extends any[] = any[]>(namespace: string): ServerBridge<'arr', Data> {
    if (!this.bridges.has(namespace))
      this.bridges.set(namespace, new ServerBridge(namespace, 'arr'));
    const inst = this.bridges.get(namespace)!;
    invariant(
      inst.type === 'arr',
      `Cannot create an array bridge in an object bridge namespace. Received type ${inst.type}`
    );
    return inst as ServerBridge<'arr', Data>;
  }

  public readonly namespace: string;
  public readonly data: D;
  private type: T;
  private sockets = new Map<Socket, () => void>();

  private constructor(namespace: string, type: T) {
    this.namespace = namespace;
    this.type = type;
    this.data = observable(type === 'obj' ? {} as Record<string, any> : [] as any);
  }

  attach(socket: Socket) {
    if (this.sockets.has(socket)) return;
    let applyingPatches = 0;

    const snapshot = (ack: (r: Snapshot) => void) => {
      ack({
        status: 'ok',
        body: toJS(this.data)
      });
    }

    const write = (payload: Write, ack: (r: WriteResult) => void) => {
      applyingPatches++;
      try {
        runInAction(() => {
          jsonpatch.applyPatch(this.data, payload.patches, true);
        });
        ack({ status: 'ok' } as WriteResult);
      } catch (e: any) {
        ack({ status: 'invalid', body: toJS(this.data) } as WriteResult);
      } finally {
        applyingPatches--;
      }
    }


    socket.on(`bridge:${this.namespace}:snapshot`, snapshot);
    socket.on(`bridge:${this.namespace}:write`, write);

    const disposer = reaction(
      () => toJS(this.data),
      (current, previous) => {
        if (!applyingPatches) {
          socket.emit(
            `bridge:${this.namespace}: write`,
            { patches: jsonpatch.compare(previous, current) } as Write
          );
        }
      }
    );

    this.sockets.set(socket, () => {
      socket.off(`bridge:${this.namespace}: snapshot`, snapshot);
      socket.off(`bridge:${this.namespace}: write`, write);
      disposer();
    });

    return this.sockets.get(socket)!
  }

  detach(socket: Socket) {
    this.sockets.get(socket)?.();
    this.sockets.delete(socket);
  }
}

