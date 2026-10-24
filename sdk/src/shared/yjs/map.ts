import { $Y } from "./symbol.ts";
import type { BindContext, BoundMap, JSONObject, YJSON } from "./types.ts";
import * as Y from "yjs";

export function bindMap<R extends JSONObject = JSONObject>(
  y: Y.Map<YJSON>,
  context: BindContext
): BoundMap<R> {
  const { cache, jsFromY, yFromJS } = context;
  if (cache.has(y))
    return cache.get(y) as BoundMap<R>;
  const proxy = new Proxy(Object.create(null), {
    deleteProperty(_target, p) {
      if (typeof p === 'string')
        y.delete(p);
      return true;
    },
    get(target, p, _receiver) {
      if (p === $Y)
        return y;

      if (typeof p === 'string' && y.has(p))
        return jsFromY(y.get(p));

      return Reflect.get(target, p);
    },
    has(_target, p) {
      return typeof p === 'string' && y.has(p);
    },
    set(_target, p, newValue, _receiver) {
      if (typeof p === 'symbol')
        throw TypeError(`Property of type symbol is not applicable for yjs. Received ${p.toString()}`);
      y.set(p, yFromJS(newValue));
      return true;
    },
    ownKeys() {
      return Array.from(y.keys());
    },
    getOwnPropertyDescriptor(_target, property) {
      if (typeof property !== 'string' || !y.has(property))
        return undefined;

      return {
        configurable: true,
        enumerable: true,
        writable: true,
        value: jsFromY(y.get(property))
      };
    },
    defineProperty: () => false,
    preventExtensions: () => false,
    setPrototypeOf: () => false,
  });
  cache.set(y, proxy);
  return proxy as BoundMap<R>;
}
