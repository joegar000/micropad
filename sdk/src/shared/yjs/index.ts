import * as Y from 'yjs';
import { isJSONObject, isJSONArray, isJSONValue, curryRight } from 'es-toolkit';
import type { YJSON, BindContext, JSONPrimitive } from './types';
import { bindMap } from './map';
import { bindArray } from './array';

const createContext = (): BindContext => {
  const context: BindContext = {
    cache: new WeakMap(),
    yFromJS(val) {
      if (!isJSONValue(val))
        throw TypeError('Cannot convert non-json value into a yjs object');

      if (isJSONArray(val)) {
        const yArray = new Y.Array<YJSON>();
        yArray.insert(0, val.map(context.yFromJS));
        return yArray;
      }

      if (isJSONObject(val)) {
        const yMap = new Y.Map<YJSON>();
        for (const [key, value] of Object.entries(val)) {
          yMap.set(key, context.yFromJS(value));
        }
        return yMap;
      }

      return val;
    },
    jsFromY(value) {
      if (value instanceof Y.Map)
        return bindMap(value, context);

      if (value instanceof Y.Array)
        return bindArray(value, context);

      return value as JSONPrimitive;
    },
    transact(y, operation) {
      if (y.doc)
        y.doc.transact(operation);
        else
        operation();
    }
  };
  return context;
};

const context = createContext();
const wrappedBindMap = curryRight(bindMap)(context);
const wrappedBindArray = curryRight(bindArray)(context);
export { wrappedBindMap as bindMap, wrappedBindArray as bindArray };
export { bindMap as _bindMap, bindArray as _bindArray };
export { $Y } from './symbol.ts';
export type * from './types.ts';
export * from './mobxify.ts';

