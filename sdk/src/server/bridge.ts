import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { type Snapshot, type Write, type WriteResult } from "../shared/bridge/protocol";
import { memoize } from "es-toolkit/function";

const getNamespaceDescriptor = memoize((namespace: string) => {
  const obs: Record<string, any> = observable({});

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

export function bridge(namespace: string) {
  const desc = getNamespaceDescriptor(namespace);
  return {
    get data() {
      return desc.observable;
    },
    get attach() {
      return desc.attach;
    }
  }
}

