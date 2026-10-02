import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { pageHelpers, usePage } from "../../model/layout";

export default function Cell(props: { x: number, y: number, children?: ReactNode }) {
  const page = usePage();
  const helpers = pageHelpers(page);
  const { ref } = useDroppable({
    id: `${props.x},${props.y}`,
    disabled: !helpers.cellAvailable(props.x, props.y)

  });
  return (
    <div className="h-full" ref={ref} data-x={props.x} data-y={props.y}>
      {props.children}
    </div>
  );
}

