import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const { ref } = useDroppable({ id: `${props.x},${props.y}` })
  return (
    <div className="h-full" ref={ref} data-x={props.x} data-y={props.y}>
      {props.children}
    </div>
  );
}

