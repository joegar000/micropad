import { action, makeObservable, observable } from "mobx";
import { type IWidget, type IPage } from "../../server/db/db.ts";
import { createContext, useContext } from "react";
import type LayoutModel from "./layout.tsx";

export default class PageLayout {
  data: IPage;
  index: number;
  layout: LayoutModel;
  cellHeight: number = 0;
  gridHeight: number = 0;
  gridWidth: number = 0;

  constructor(page: IPage, index: number, layout: LayoutModel) {
    this.data = page;
    this.index = index;
    this.layout = layout;

    makeObservable(this, {
      data: observable,
      index: observable,
      cellHeight: observable,
      gridHeight: observable,
      gridWidth: observable,
      placeWidget: action,
      removeWidget: action
    });
  }

  placeWidget(widget: IWidget, x: number, y: number, w?: number, h?: number): boolean {
    w = w ?? this.data.widgetCoords[widget.uniqId]?.w ?? 1;
    h = h ?? this.data.widgetCoords[widget.uniqId]?.h ?? 1;
    for (let i = x; i <= x + w - 1; i++) {
      for (let j = y; j <= y + h - 1; j++) {
        if (!this.cellAvailable(i, j) && this.widgetAt(i, j)?.uniqId !== widget.uniqId)
          return false;
      }
    }
    this.data.widgets[widget.uniqId] = widget;
    this.data.widgetCoords[widget.uniqId] = { x, y, w, h };

    this.layout.pages.forEach((p, i) => {
      if (i === this.index) return;
      p.removeWidget(widget.uniqId);
    });
    return true;
  }

  removeWidget(uniqId: string) {
    if (!(uniqId in this.data.widgets))
      return false;
    delete this.data.widgets[uniqId];
    delete this.data.widgetCoords[uniqId];
    return true;
  }

  cellAvailable(x: number, y: number) {
    return !this.widgetAt(x, y);
  }

  /**
   * Finds the widget that originates on the coordinates `x`, `y`. If a widget does
   * not originate on those coordinates then returns `null`.
   */
  widgetRootAt(x: number, y: number) {
    for (const [uniqId, { x: wX, y: wY }] of Object.entries(this.data.widgetCoords)) {
      if (x === wX && y === wY)
        return this.data.widgets[uniqId];
    }
    return null;
  }

  /**
   * Finds the widget that overlaps with the coordinates `x`, `y`. If a widgets does
   * not overlap with those coordinates then returns `null`.
   */
  widgetAt(x: number, y: number) {
    for (const [uniqId, { x: wX, y: wY, h: wH, w: wW }] of Object.entries(this.data.widgetCoords)) {
      const startX = wX;
      const endX = wX + wW - 1;
      const startY = wY;
      const endY = wY + wH - 1;
      if (startX <= x && x <= endX && startY <= y && y <= endY)
        return this.data.widgets[uniqId];
    }
    return null;
  }
}

export const PageModelContext = createContext<PageLayout | null>(null);

export const usePage = () => {
  const page = useContext(PageModelContext);
  if (!page)
    throw Error('`usePage()` called outside of `PageModelContext');
  return page;
}

