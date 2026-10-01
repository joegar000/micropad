import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import type { IPreservedState } from 'micropad-sdk/shared';
import { observable, reaction, toJS } from 'mobx';
import path from 'path';

export type Schema = Partial<{
  pluginState: Record<string, Partial<IPreservedState>>
  layouts: {
    [name: string]: {
      columns: number;
      rows: number;
      widgets: {
        x: number,
        y: number,
        w: number,
        h: number,
        widgetId: string,
        pluginId: string
      }[]
    }
  }
}>;

export class DB {
  private static instance: DB;

  private readonly data: Schema;

  private constructor() {
    const lowdb = new LowSync<Schema>(
      new JSONFileSync(path.join(import.meta.dirname, 'db.json')),
      {
        pluginState: {},
        layouts: {
          ['Micropad']: {
            columns: 3,
            rows: 3,
            widgets: []
          }
        }
      }
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
