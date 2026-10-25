import { $Y } from "./symbol.ts";
import type { BindContext, BoundArray, JSON, JSONArray, YJSON } from "./types.ts";
import * as Y from "yjs";

export function toInteger(value: unknown): number {
  const number = Number(value);

  if (Number.isNaN(number) || number === 0)
    return 0;

  if (!Number.isFinite(number))
    return number;

  return Math.trunc(number);
}

export function normalizeIndex(value: unknown, length: number): number {
  const index = toInteger(value);

  if (index < 0)
    return Math.max(length + index, 0);

  return Math.min(index, length);
}

export function getArrayIndex(property: string | symbol): number | undefined {
  if (typeof property !== 'string')
    return undefined;

  const index = Number(property);
  if (
    !Number.isInteger(index)
    || index < 0
    || index >= 0xffffffff
    || String(index) !== property
  ) {
    return undefined;
  }

  return index;
}


export function bindArray<R extends JSON = JSON>(
  y: Y.Array<YJSON>,
  context: BindContext
): BoundArray<R> {
  const { cache, jsFromY, yFromJS, transact } = context;
  if (cache.has(y))
    return cache.get(y) as BoundArray<R>;

  const replaceRange = (start: number, deleteCount: number, values: JSON[]) => {
    // Convert before deleting because values may be proxies for children that
    // are about to become detached from this array.
    const insertions = values.map(yFromJS);

    if (deleteCount === 0 && insertions.length === 0)
      return;

    transact(y, () => {
      if (deleteCount > 0)
        y.delete(start, deleteCount);

      if (insertions.length > 0)
        y.insert(start, insertions);
    });
  };

  const arrayMethods = {
    push: (...items: JSON[]) => {
      const insertions = items.map(yFromJS);
      if (insertions.length > 0) {
        transact(y, () => {
          y.push(insertions);
        });
      }

      return y.length;
    },
    pop: () => {
      if (y.length === 0)
        return undefined;

      const lastIndex = y.length - 1;
      const removed = jsFromY(y.get(lastIndex));
      transact(y, () => {
        y.delete(lastIndex, 1);
      });
      return removed;
    },
    shift: () => {
      if (y.length === 0)
        return undefined;

      const removed = jsFromY(y.get(0));
      transact(y, () => {
        y.delete(0, 1);
      });
      return removed;
    },
    unshift: (...items: JSON[]) => {
      const insertions = items.map(yFromJS);
      if (insertions.length > 0) {
        transact(y, () => {
          y.insert(0, insertions);
        });
      }

      return y.length;
    },
    splice: (...args: Parameters<Array<JSON>['splice']>) => {
      if (args.length === 0)
        return [];

      const length = y.length;
      const start = normalizeIndex(args[0], length);
      let deleteCount: number;
      let items: JSON[];

      if (args.length === 1) {
        deleteCount = length - start;
        items = [];
      } else {
        deleteCount = Math.min(
          Math.max(toInteger(args[1]), 0),
          length - start,
        );
        items = args.slice(2) as JSON[];
      }

      const deleted = y
        .slice(start, start + deleteCount)
        .map(jsFromY);

      replaceRange(start, deleteCount, items);
      return deleted;
    },
    reverse: () => {
      const before = y.toArray().map(jsFromY);
      const reversed = before.slice().reverse();
      const changed = reversed.some(
        (value, index) => !Object.is(value, before[index]),
      );

      if (changed)
        replaceRange(0, before.length, reversed);

      return proxy;
    },
    sort: (compareFn?: (a: JSON, b: JSON) => number) => {
      const before = y.toArray().map(jsFromY);
      const sorted = before.slice();
      sorted.sort(compareFn);

      const changed = sorted.some(
        (value, index) => !Object.is(value, before[index]),
      );

      if (changed)
        replaceRange(0, before.length, sorted);

      return proxy;
    },
    fill: (value: JSON, startValue: number = 0, endValue: number = y.length) => {
      const length = y.length;
      const start = normalizeIndex(startValue, length);
      const end = normalizeIndex(endValue, length);
      const count = Math.max(end - start, 0);

      if (count > 0) {
        replaceRange(
          start,
          count,
          Array.from({ length: count }, () => value),
        );
      }

      return proxy;
    },
    copyWithin: (targetValue: number, startValue: number, endValue: number = y.length) => {
      const values = y.toArray().map(jsFromY);
      const length = values.length;
      const target = normalizeIndex(targetValue, length);
      const start = normalizeIndex(startValue, length);
      const end = normalizeIndex(endValue, length);
      const count = Math.min(
        Math.max(end - start, 0),
        length - target,
      );

      if (count > 0) {
        const copied = values.slice(start, start + count);
        replaceRange(target, count, copied);
      }
      return proxy;
    },
  };

  const proxy = new Proxy([] as JSON[], {
    deleteProperty(_target, p) {
      const i = getArrayIndex(p);
      if (i !== undefined && i < y.length) {
        transact(y, () => {
          y.delete(i, 1);
        });
      }

      return true;
    },
    get(target, p, receiver) {
      if (p === $Y)
        return y;

      if (p === 'length')
        return y.length;

      const i = getArrayIndex(p);
      if (i !== undefined)
        return i < y.length ? jsFromY(y.get(i)) : undefined;

      if (typeof p === 'string' && Object.hasOwn(arrayMethods, p)) {
        return arrayMethods[p as keyof typeof arrayMethods];
      }

      return Reflect.get(target, p, receiver);
    },
    has(target, p) {
      const i = getArrayIndex(p);
      if (i !== undefined)
        return i < y.length;

      if (p === $Y)
        return true;

      return Reflect.has(target, p);
    },
    set(_target, p, newValue, _receiver) {
      if (typeof p === 'symbol')
        throw TypeError(`Property of type symbol is not applicable for yjs. Received ${p.toString()}`);

      if (p === 'length') {
        const newLength = Number(newValue);
        if (
          !Number.isInteger(newLength)
          || newLength < 0
          || newLength > 0xffffffff
        ) {
          throw new RangeError('Invalid array length');
        }

        if (newLength > y.length)
          throw new RangeError('A Yjs-backed array cannot contain sparse positions');

        if (newLength < y.length) {
          const deleteCount = y.length - newLength;
          transact(y, () => {
            y.delete(newLength, deleteCount);
          });
        }

        return true;
      }

      const index = getArrayIndex(p);
      if (index === undefined)
        throw new TypeError('Only array indices can be assigned');

      if (index > y.length)
        throw new RangeError('A Yjs-backed array cannot contain sparse positions');

      const converted = yFromJS(newValue);
      transact(y, () => {
        if (index < y.length)
          y.delete(index, 1);

        y.insert(index, [converted]);
      });

      return true;
    },
    ownKeys() {
      return [
        ...Array.from({ length: y.length }, (_, index) => String(index)),
        "length"
      ];
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === "length") {
        return {
          ...Reflect.getOwnPropertyDescriptor(target, "length")!,
          value: y.length
        };
      }

      const index = getArrayIndex(property);
      if (index !== undefined && index < y.length) {
        return {
          configurable: true,
          enumerable: true,
          writable: true,
          value: jsFromY(y.get(index))
        };
      }

      return Reflect.getOwnPropertyDescriptor(target, property);
    },
    defineProperty: () => false,
    preventExtensions: () => false,
    setPrototypeOf: () => false,
  }) as BoundArray<R>;
  cache.set(y, proxy as JSONArray);
  return proxy;
}

