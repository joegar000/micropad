export type ValueOrCallback<V> = (value: V | ((prev: V) => V)) => void;

export function valueOrCallback<V>(value: V | ((v: V) => V), current: V): V {
  if (value instanceof Function) {
    return value(current);
  }
  return value;
}