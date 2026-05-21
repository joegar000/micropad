import type { IWidgetModel } from "micropad-widgets";
import type { LayoutItem } from "react-grid-layout";

export interface WidgetMeta {
  [id: string]: Pick<IWidgetModel, 'type'>;
}

export interface Grid {
  rows: number;
  columns: number;
  widgets: LayoutItem[];
  meta: WidgetMeta;
}
