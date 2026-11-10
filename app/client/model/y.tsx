import { $Y, type BoundArray, type BoundMap } from "micropad-sdk/shared";
import type * as Y from "yjs";

export abstract class YModel {
  get doc(): Y.Doc | null {
    return (this as unknown as { data: BoundMap | BoundArray }).data[$Y].doc;
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
