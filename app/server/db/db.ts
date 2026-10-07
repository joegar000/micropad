import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import type { IPreservedState } from 'micropad-sdk/shared';
import { observable, reaction, toJS } from 'mobx';
import path from 'path';

export type Schema = {
  pluginState: Record<string, Partial<IPreservedState>>
  layouts: {
    name: string;
    pages: {
      columns: number;
      rows: number;
      widgets: {
        [uniqId: string]: {
          uniqId: string,
          widgetId: string,
          pluginId: string
        }
      },
      widgetCoords: {
        [uniqId: string]: {
          x: number,
          y: number,
          w: number,
          h: number
        }
      }
    }[]
  }[]
};
export type ILayout = Schema['layouts'][number];
export type IPage = ILayout['pages'][number];
export type IWidget = IPage['widgets'][string];
export type IWidgetCoords = IPage['widgetCoords'][string];

export class DB {
  private static instance: DB;

  private readonly data: Schema;

  private constructor() {
    const lowdb = new LowSync<Schema>(
      new JSONFileSync(path.join(import.meta.dirname, 'db.json')),
      // FIX: This default plugin state overwrites the database every time
      {
        pluginState: {},
        layouts: [{
          name: 'Micropad',
          pages: [{
            columns: 3,
            rows: 3,
            widgets: {},
            widgetCoords: {}
          }]
        }]
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
