import type { BoundArray, BoundJSON, BoundMap, JSON, JSONObject } from './types.ts';
import { $Y } from './symbol.ts';
import { createAtom, type IAtom, transaction } from 'mobx';
import { getArrayIndex } from './array.ts';

const $mobxified = Symbol();

export function mobxify<O>(obj: O): O {
  if (typeof obj !== 'object' || obj === null)
    return obj;
  if (cache.has(obj))
    return cache.get(obj);

  if (!($Y in obj) || $mobxified in obj)
    return obj;

  if (!cache.has(obj)) {
    if (Array.isArray(obj))
      cache.set(obj, mobxifyArray(obj as BoundArray));
    else
      cache.set(obj, mobxifyMap(obj as BoundMap));
  }

  return cache.get(obj)!;
}

const cache = new WeakMap<BoundJSON<any>, BoundJSON<any>>();

function mobxifyMap(map: BoundMap<JSONObject>): typeof map {
  const y = map[$Y];
  const propertyAtoms = new Map<string, IAtom>();
  const keysAtom = createAtom('Y.Map.keys()');
  const getPropertyAtom = (property: string) => {
    let atom = propertyAtoms.get(property);
    if (!atom) {
      atom = createAtom(
        `Y.Map.${property}`,
        undefined,
        () => {
          if (propertyAtoms.get(property) === atom)
            propertyAtoms.delete(property)
        }
      );
      propertyAtoms.set(property, atom);
    }
    return atom;
  }

  const proxy = new Proxy(map, {
    get(target, p, receiver) {
      if (p === $mobxified)
        return true;
      if (typeof p === "string")
        getPropertyAtom(p).reportObserved();
      return mobxify(Reflect.get(target, p, receiver));
    },
    has(target, property) {
      if (property === $mobxified)
        return true;
      if (typeof property === "string")
        getPropertyAtom(property).reportObserved();
      return Reflect.has(target, property);
    },
    ownKeys(target) {
      keysAtom.reportObserved();
      return Reflect.ownKeys(target);
    }
  });
  y.observe(event => {
    transaction(() => {
      for (const [key, change] of event.changes.keys) {
        propertyAtoms.get(key)?.reportChanged();

        if (['add', 'delete'].includes(change.action)) {
          keysAtom.reportChanged();
        }
      }
    });
  });
  return proxy;
}

function mobxifyArray<B extends BoundArray<JSON>>(arr: B): B {
  const y = arr[$Y];
  const indexAtoms = new Map<string, IAtom>();
  const lengthAtom = createAtom('Y.Array.length');
  const getIndexAtom = (property: string) => {
    let atom = indexAtoms.get(property);
    if (!atom) {
      atom = createAtom(
        `Y.Array[${property}]`,
        undefined,
        () => {
          if (indexAtoms.get(property) === atom)
          indexAtoms.delete(property);
        }
      );
      indexAtoms.set(property, atom);
    }
    return atom;
  }
  const arrayMutators = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort', 'fill', 'copyWithin']);
  const methodWrappers = new Map<(...args: any[]) => any, (...args: any[]) => any>();

  const proxy = new Proxy(arr, {
    get(target, p, receiver) {
      if (p === $mobxified)
        return true;
      if (p === 'length') {
        lengthAtom.reportObserved();
        return Reflect.get(target, p, receiver);
      }

      if (arrayMutators.has(p as string)) {
        const method = Reflect.get(target, p, receiver) as (...args: any[]) => any;
        if (!methodWrappers.has(method)) {
          if (p !== 'splice') {
            methodWrappers.set(method, (...args: any[]) => {
              return mobxify(Reflect.apply(method, receiver, args));
            });
          } else {
            methodWrappers.set(method, (...args: any[]) => {
              return Reflect.apply(method, receiver, args).map(mobxify);
            });
          }
        }

        return methodWrappers.get(method);
      }

      const index = getArrayIndex(p);

      if (index === undefined)
        return Reflect.get(target, p, receiver);
      else
        getIndexAtom(p as string).reportObserved();

      return mobxify(Reflect.get(target, p, receiver) as BoundJSON<JSON>);
    },
    has(target, property) {
      if (property === $mobxified)
        return true;
      if (getArrayIndex(property) !== undefined)
        lengthAtom.reportObserved();
      return Reflect.has(target, property);
    },
    ownKeys(target) {
      lengthAtom.reportObserved();
      return Reflect.ownKeys(target);
    }
  });
  y.observe(event => {
    let position = 0;
    let firstChanged: number | undefined;
    let lengthDelta = 0;

    for (const operation of event.delta) {
      if ("retain" in operation) {
        position += operation.retain!;
        continue;
      }

      if ("delete" in operation) {
        firstChanged ??= position;
        lengthDelta -= operation.delete!;
        continue;
      }

      if ("insert" in operation) {
        firstChanged ??= position;
        lengthDelta += (operation.insert! as any[]).length;
        position += (operation.insert! as any[]).length;
      }
    }
    transaction(() => {
      if (firstChanged !== undefined) {
        for (const [index, atom] of indexAtoms) {
          if (Number(index) >= firstChanged)
            atom.reportChanged();
        }
      }
      if (lengthDelta !== 0)
        lengthAtom.reportChanged();
    });
  });
  return proxy;
}

