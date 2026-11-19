import { type BoundArray, type BoundMap, getY } from "y-json";
import type * as Y from "yjs";

export abstract class YModel {
  get doc(): Y.Doc | null {
    return getY((this as unknown as { data: BoundMap | BoundArray }).data).doc;
  }
}

export function transact<This extends YModel, Args extends unknown[], Result>(
  method: (this: This, ...args: Args) => Result,
  _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Result>
) {
  return function (this: This, ...args: Args): Result {
    const doc = this.doc;
    if (!doc)
      return method.apply(this, args);

    let result!: Result;
    doc.transact(() => {
      result = method.apply(this, args);
    }, this);
    return result;
  };
}
