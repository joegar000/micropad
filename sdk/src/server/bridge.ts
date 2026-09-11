import { observable, reaction, runInAction, toJS } from "mobx";
import { Socket } from "socket.io";
import * as jsonpatch from "fast-json-patch";
import { Protocol } from "../shared/bridge/protocol";

const observableCache = new Map<string, Record<string, any>>();
const observableRevision = new Map<string, number>();
export function createBridgeGenerator(socket: Socket) {
  const socketCache = new Map<string, Socket>();
  let applyingRemote = 0;

  return function bridge(namespace: string): Record<string, any> {;
    if (!observableRevision.has(namespace)) {
      observableRevision.set(namespace, 0);
    }
    if (!observableCache.has(namespace)) {
      observableCache.set(namespace, observable({}));
    }

    if (!socketCache.get(namespace)!) {
      socket.on(
        `bridge:${namespace}:snapshot`, (ack) => {
          Protocol.snapshot({
            status: 'ok',
            body: toJS(observableCache.get(namespace))
          }, ack);
        }
      );

      socketCache.set(namespace, socket);
      const obj = observableCache.get(namespace)!;
      reaction(
        () => toJS(obj),
        (current, previous) => {
          if (applyingRemote) return;

          const patches = jsonpatch.compare(previous, current);
          if (patches.length) {
            socket.emit(`bridge:${namespace}:post`, patches);
          }
        }
      );
      socket.on(`bridge:${namespace}:post`, (patches, ack) => {
        applyingRemote++;
        try {
          runInAction(() => {
            jsonpatch.applyPatch(obj, patches, true, true);
          });
          ack({ status: 'ok' });
        }
        catch (e) {
          ack({ status: 'failed', reason: e });
        } finally {
          applyingRemote--;
        }
      });
    }
    return observableCache.get(namespace)!;
  }
}
