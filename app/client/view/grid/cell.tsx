import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { usePage } from "../../model/page.tsx";
import clsx from "clsx";

export type CellData = { x: number, y: number };

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const page = usePage();
  const { ref, isDropTarget } = useDroppable<CellData>({
    id: `${props.x},${props.y}`,
    data: { x: props.x, y: props.y },
    disabled: !page.cellAvailable(props.x, props.y)
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

