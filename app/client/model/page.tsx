import { runInAction } from "mobx";
import { type IWidget, type IPage } from "../../server/db/db.ts";
import { createContext, useContext } from "react";
import type { ClientPlugin } from "micropad-sdk/client";

export default class Page {
  data: IPage;

  constructor(page: IPage) {
    this.data = page;
  }

  placeWidget(widget: IWidget, x: number, y: number, w: number = 1, h: number = 1): boolean {
    for (let i = x; i <= x + w - 1; i++) {
      for (let j = y; j <= y + h - 1; j++) {
        if (!this.cellAvailable(i, j))
          return false;
      }
    }
    runInAction(() => {
      this.data.widgets[widget.uniqId] = widget;
      this.data.widgetCoords[widget.uniqId] = { x, y, w, h };
    });
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

  /**
   * Creates a new widget whose uniqId is not yet used.
   * Responds to mobx changes since it checks if `id in this.data.widgets`
   */
  newWidget(plugin: ClientPlugin, widgetId: string) {
    return {
      uniqId: this.createId(),
      pluginId: plugin.displayName,
      widgetId: widgetId
    }
  }

  private createId(): string {
    const id = `${Math.random()}`.replace('0.', '');
    if (id in this.data.widgets)
      return this.createId();
    return id;
  }
}

export const PageModelContext = createContext<Page | null>(null);

export const usePage = () => {
  const page = useContext(PageModelContext);
  if (!page)
    throw Error('`usePage()` called outside of `PageModelContext');
  return page;
}

