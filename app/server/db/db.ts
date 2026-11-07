import { debounce } from 'es-toolkit/compat';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import type { IPreservedState } from 'micropad-sdk/shared';
import { bindMap, mobxify } from 'micropad-sdk/shared';
import path from 'path';
import * as Y from 'yjs';

export type Schema = {
  pluginState: Record<string, Partial<IPreservedState>>;
  layouts: {
    name: string;
    pages: {
      columns: number;
      rows: number;
      widgets: {
        [uniqId: string]: {
          uniqId: string;
          widgetId: string;
          pluginId: string;
        }
      };
      widgetCoords: {
        [uniqId: string]: {
          x: number;
          y: number;
          w: number;
          h: number;
        }
      }
    }[]
  }[]
};
export type ILayout = Schema['layouts'][number];
export type IPage = ILayout['pages'][number];
export type IWidget = IPage['widgets'][string];
export type IWidgetCoords = IPage['widgetCoords'][string];

const lowdb = new LowSync<Schema>(
  new JSONFileSync(path.join(import.meta.dirname, 'db.json')),
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
lowdb.read();

export class DB {
  static getSynced(doc: Y.Doc): Schema {
    const data = mobxify(bindMap(doc.getMap('db'))) as unknown as Schema;
    doc.transact(() => {
      for (const key in lowdb.data) {
        data[key as keyof Schema] = lowdb.data[key as keyof Schema] as any;
      }
    });

    doc.get('db').observeDeep(debounce(() => {
      lowdb.data = doc.getMap('db').toJSON() as unknown as Schema;
      lowdb.write();
    }, 200));
    return data as unknown as Schema;
  }
}
