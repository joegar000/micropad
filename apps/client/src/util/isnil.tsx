export function isNil(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

export function notNil<V>(v: V | null | undefined): v is V {
  return !isNil(v);
}