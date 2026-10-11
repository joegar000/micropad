import { useState, type ReactNode } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { Feedback, type Draggable } from "@dnd-kit/dom";
import type { CellData } from "../grid/cell";
import { observer } from "mobx-react-lite";
import type { IWidget } from "../../../server/db/db.ts";
import './styles.css'
import PageLayout, { usePage } from "../../model/page.tsx";
import { WidgetContent, type WidgetProps } from "../grid/widget.tsx";

const DragProvider = observer((props: {
  onDragStart?: () => void,
  onDragEnd?: () => void,
  children: ReactNode
}) => {
  const page = usePage();
  const [widgetCoords, setWidgetCoords] = useState<PageLayout['data']['widgetCoords'][string] | null>(null);
  return (
    <DragDropProvider
      plugins={defaults => [...defaults, Feedback.configure({ feedback: 'move' })]}
      onBeforeDragStart={event => {
        const source = event.operation.source as Draggable<WidgetProps>;
        const rect = source?.element?.getBoundingClientRect();
        if (!source || !rect) return;
        setWidgetCoords(page.data.widgetCoords[source.data.uniqId]);
        document.body.style.setProperty(`--overlay-width`, `${rect!.width}px`);
        document.body.style.setProperty('--overlay-height', `${rect!.height}px`);
      }}
      onDragStart={_event => {
        props.onDragStart?.();
      }}
      onDragOver={event => {
        const { target } = event.operation;
        const rect = target?.shape?.boundingRectangle;
        if (!rect) return;
        document.body.style.setProperty('--overlay-width', `${rect!.width * (widgetCoords?.w ?? 1)}px`);
        document.body.style.setProperty('--overlay-height', `${rect!.height * (widgetCoords?.h ?? 1)}px`);
      }}
      onDragEnd={event => {
        props.onDragEnd?.();
        setWidgetCoords(null);

        const target = event.operation.target;
        const source = event.operation.source;
        if (!target || !source || event.canceled) return;
        const { x, y } = target.data as CellData;
        page.placeWidget(source.data as IWidget, x, y, widgetCoords?.w, widgetCoords?.h);
        setTimeout(() => {
          document.body.style.removeProperty('--overlay-width');
          document.body.style.removeProperty('--overlay-height');
        }, 300);
      }}
    >
      <DragOverlay>
        {(source: Draggable<IWidget>) => (
          <div className="transition-all" style={{ width: `var(--overlay-width)`, height: `var(--overlay-height)` }}>
            <WidgetContent {...source.data} />
          </div>
        )}
      </DragOverlay>
      {props.children}
    </DragDropProvider>
  );
});
export default DragProvider;
