import type { ReactNode } from "react";
import { useDragOperation, useDroppable } from "@dnd-kit/react";
import { usePage } from "../../model/page.tsx";
import clsx from "clsx";

export type CellData = { x: number, y: number };

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const page = usePage();
  const { source } = useDragOperation();
  const available = page.cellAvailable(props.x, props.y);
  const disabled = source ? source.id !== page.widgetAt(props.x, props.y)?.uniqId && !available : !available;
  const { ref, isDropTarget } = useDroppable<CellData>({
    id: `${page.index}: ${props.x},${props.y}`,
    data: { x: props.x, y: props.y },
    disabled
  });
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

