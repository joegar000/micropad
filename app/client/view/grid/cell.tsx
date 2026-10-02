import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { pageHelpers, usePage } from "../../model/layout";
import clsx from "clsx";

export type CellData = { x: number, y: number };

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const page = usePage();
  const helpers = pageHelpers(page);
  const { ref, isDropTarget } = useDroppable<CellData>({
    id: `${props.x},${props.y}`,
    data: { x: props.x, y: props.y },
    disabled: !helpers.cellAvailable(props.x, props.y)
  });
  return (
    <div
      className={clsx("h-full", isDropTarget && "bg-white")}
      ref={ref} data-x={props.x} data-y={props.y}
    >
      {props.children}
    </div>
  );
}

