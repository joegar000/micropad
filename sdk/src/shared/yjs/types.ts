import * as Y from 'yjs';
import type { $Y } from './symbol';

export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [key: string]: JSON };
export type JSONArray = JSON[];
export type JSON = JSONPrimitive | JSONObject | JSONArray;
export type YJSON = JSONPrimitive | Y.Map<YJSON> | Y.Array<YJSON>;

export type BoundMap<O extends JSONObject = JSONObject> = { readonly [$Y]: Y.Map<YJSON> } & { [K in keyof O]: BoundJSON<O[K]> };
export type BoundArray<O extends JSON = JSON> = { readonly [$Y]: Y.Array<YJSON> } & Array<BoundJSON<O>>;
export type BoundJSON<J extends JSON> = J extends Array<infer V extends JSON> ? BoundArray<V> : (
  J extends JSONObject ? BoundMap<J> : J
);


export type BindContext = {
  cache: WeakMap<Y.AbstractType<any>, JSON>;
  jsFromY(y: unknown): JSON;
  yFromJS(value: unknown): YJSON;
  transact(y: Y.AbstractType<any>, operation: () => void): void;
}

