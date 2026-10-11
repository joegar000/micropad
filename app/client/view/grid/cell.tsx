import type { ReactNode } from "react";
import { useDragOperation, useDroppable } from "@dnd-kit/react";
import { usePage } from "../../model/page.tsx";
import clsx from "clsx";
import type { WidgetProps } from "./widget.tsx";
import type { Draggable, Droppable } from "@dnd-kit/dom";

export type CellData = { x: number, y: number };

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const page = usePage();
  const id = `${page.index}: ${props.x},${props.y}`;
  const { source, target } = useDragOperation() as { source?: Draggable<WidgetProps>, target?: Droppable<{ x: number, y: number }> };
  const sourceCoords = source && page.layout.widgets[source.data.uniqId]?.coords;
  const width = sourceCoords?.w ?? 1;
  const height = sourceCoords?.h ?? 1;
  const available = page.cellAvailable(props.x, props.y);

  const outsideGrid = (
    props.x + width > page.data.columns
    || props.y + height > page.data.rows
  );
  const disabled = (
    outsideGrid
    || (source ? source.id !== page.widgetAt(props.x, props.y)?.uniqId && !available : !available)
  );
  const { ref } = useDroppable<CellData>({
    id,
    data: { x: props.x, y: props.y },
    disabled
  });

  const isDropTarget = !!target
    && props.x >= target.data.x
    && props.x < target.data.x + width
    && props.y >= target.data.y
    && props.y < target.data.y + height;
  return (
    <div
      className={clsx("h-full border", isDropTarget && "bg-card")}
      ref={ref} data-x={props.x} data-y={props.y}
      style={{
        gridColumn: props.x + 1,
        gridRow: props.y + 1
      }}
    >
      <div className={clsx("h-full", !disabled && "invisible")}>
        {props.children}
      </div>
    </div>
  );
}
