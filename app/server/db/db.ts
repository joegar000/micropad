import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import type { IPreservedState } from 'micropad-sdk/shared';
import { observable, reaction, toJS } from 'mobx';

export type Schema = Partial<{
  pluginState: Record<string, Partial<IPreservedState>>
  layouts: {

  }[]
}>

export class DB {
  private static instance: DB;

  private readonly data: Schema;

  private constructor() {
    const lowdb = new LowSync<Schema>(
      new JSONFileSync(fileURLToPath(new URL('db.json', import.meta.url))),
      {}
    );

    this.data = observable(lowdb.data);

    reaction(
      () => JSON.stringify(this.data),
      () => {
        lowdb.data = toJS(this.data);
        lowdb.write();
      }
    );
  }

  public static get data() {
    if (!this.instance)
      this.instance = new DB();
    return this.instance.data;
  }
}
