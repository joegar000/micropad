import type { LayoutPage, MicropadLayout, WidgetInstance } from "micropad-protocol";
import type { LayoutItem } from "react-grid-layout";

export type { LayoutPage, MicropadLayout, WidgetInstance };

export function widgetToLayoutItem(widget: WidgetInstance): LayoutItem {
  return {
    i: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h
  };
}

export function applyLayoutItemsToWidgets(
  widgets: WidgetInstance[],
  items: LayoutItem[]
): WidgetInstance[] {
  const placementById = new Map(items.map(item => [item.i, item]));
  return widgets.map(widget => {
    const placement = placementById.get(widget.id);
    if (!placement) {
      return widget;
    }

    return {
      ...widget,
      x: placement.x,
      y: placement.y,
      w: placement.w,
      h: placement.h
    };
  });
}
