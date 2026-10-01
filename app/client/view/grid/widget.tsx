import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";

const Widget = observer((props: { id: string, children: ReactNode }) => {
  const app = useApp();
  const { ref } = useDraggable({ id: props.id });
  const cellHeight = app.layout.cellHeight;
  return (
    <div className="h-full border aspect-square p-1 rounded flex justify-center items-center" ref={ref} style={{ height: cellHeight }}>
      {props.children}
    </div>
  )
});
export default Widget;
