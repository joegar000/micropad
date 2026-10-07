import { isObservable, observable, reaction, runInAction, toJS } from "mobx";
import type { Socket } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { memoize } from "es-toolkit/function";

type BridgeObject = Record<string, any> | Array<any>;

const getNamespaceDescriptor = memoize(<O extends BridgeObject>(namespace: string, obj: O) => {
  const obs: O = isObservable(obj) ? obj : observable(obj);

  const attach = memoize((socket: Socket) => {
    let applyingPatches = 0;

    socket.on(`bridge:${namespace}:snapshot`, (ack) => {
      ack({
        status: 'ok',
        body: toJS(obs)
      } as Snapshot);
    });

    socket.on(`bridge:${namespace}:write`, (payload: Write, ack) => {
      applyingPatches++;
      try {
        runInAction(() => {
          jsonpatch.applyPatch(obs, payload.patches, true);
        });
        ack({ status: 'ok' } as WriteResult);
      } catch (e: any) {
        ack({ status: 'invalid', body: toJS(obs) } as WriteResult);
      } finally {
        applyingPatches--;
      }
    });

    const disposer = reaction(
      () => toJS(obs),
      (current, previous) => {
        if (!applyingPatches) {
          socket.emit(
            `bridge:${namespace}:write`,
            { patches: jsonpatch.compare(previous, current) } as Write
          );
        }
      }
    );
    return () => {
      socket.removeAllListeners(`bridge:${namespace}:snapshot`);
      socket.removeAllListeners(`bridge:${namespace}:write`);
      disposer();
    }
  }, { getCacheKey: x => x });

  return {
    observable: obs,
    attach
  }
});

export function bridge<B extends BridgeObject = Record<string, any>>(namespace: string, obj: B = {} as B) {

  const desc = getNamespaceDescriptor<B>(namespace, obj);
  return {
    get data(): B extends never[] ? any[] : B {
      return desc.observable as any;
    },
    get attach() {
      return desc.attach;
    }
  }
}

