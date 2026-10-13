import { useCallback, useMemo, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";
import type LayoutModel from "../../model/layout.tsx";
import type { IWidget } from "../../../server/db/db.ts";
import { Resizable } from "react-resizable";
import { useCarousel } from "micropad-ui";
import { usePage } from "../../model/page.tsx";
import 'react-resizable/css/styles.css';
import { useLayout } from "../../model/layout.tsx";
import useResizeObserver from "../../hooks/resize-observer.tsx";
import clsx from "clsx";

export const WidgetContent = observer((props: WidgetProps) => {
  const app = useApp();
  const plugin = app.plugins.find(p => p.displayName === props.pluginId)!;
  const widgetDom = useMemo(() => (
    plugin.createWidget(props.widgetId).dom
  ), [plugin, props.widgetId]);
  const ref = useCallback((node: HTMLDivElement | null) => {
    node?.appendChild(widgetDom);
    return () => widgetDom.remove();
  }, [widgetDom]);

  return (
    <div
      className="w-full h-full flex justify-center items-center border border-ring p-1 rounded bg-secondary"
      ref={ref}
    />
  );
});

export type WidgetProps = Pick<
  LayoutModel['data']['pages'][number]['widgets'][string],
  'uniqId' | 'pluginId' | 'widgetId'
>;
const Widget = observer((props: WidgetProps) => {
  const layout = useLayout();
  const page = usePage();
  const { api } = useCarousel();
  const [original, setOriginal] = useState(0);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);
  const { coords } = layout.widgets[props.uniqId];
  const originalDimensionsRef = useRef<HTMLDivElement>(null);
  const gridCellRef = useRef<HTMLDivElement>(null);
  const [gridCellWidth, setGridCellWidth] = useState(0);
  const [gridCellHeight, setGridCellHeight] = useState(0);

  useResizeObserver(originalDimensionsRef, useCallback(entry => {
    setOriginal(entry.contentRect.width);
  }, []));

  useResizeObserver(gridCellRef, useCallback(entry => {
    setGridCellWidth(entry.contentRect.width);
    setGridCellHeight(entry.contentRect.height);
  }, []));

  const { ref: dragRef, handleRef, isDragging } = useDraggable<IWidget>({
    id: props.uniqId,
    data: {
      uniqId: props.uniqId,
      pluginId: props.pluginId,
      widgetId: props.widgetId
    },
    disabled: resizing
  });

  return (
    <>
      <div
        ref={originalDimensionsRef}
        style={{
          gridColumn: `${coords.x + 1} / span 1`,
          gridRow: `${coords.y + 1} / span 1`
        }}
      />
      <Resizable
        className={clsx(isDragging && "invisible")}
        width={width ?? gridCellWidth}
        height={height ?? gridCellHeight}
        onResize={(_event, { size }) => {
          page.placeWidget(
            props,
            coords.x,
            coords.y,
            Math.round(size.width / original),
            Math.round(size.height / original)
          );
          setWidth(size.width);
          setHeight(size.height);
        }}
        onResizeStart={(_, { size }) => {
          setWidth(size.width);
          setHeight(size.height);
          setResizing(true);
          api?.reInit({ watchDrag: false });
        }}
        onResizeStop={(_, resize) => {
          page.placeWidget(
            props,
            coords.x,
            coords.y,
            Math.round(resize.size.width / original),
            Math.round(resize.size.height / original)
          );
          setWidth(null);
          setHeight(null);
          setResizing(false);
          api?.reInit({ watchDrag: true });
        }}
      >
        <div
          className="h-full relative transition-all"
          ref={node => {
            gridCellRef.current = node;
            dragRef(node);
          }}
          data-uniq-id={props.uniqId}
          style={{
            gridColumn: `${coords.x + 1} / span ${coords.w}`,
            gridRow: `${coords.y + 1} / span ${coords.h}`
          }}
        >
          {resizing && <div className="absolute border-2 border-dashed border-ring rounded z-1"
            style={{
              width: width ?? gridCellWidth,
              height: height ?? gridCellHeight
            }}
          />}
          <div className="h-full w-full" ref={handleRef}>
            <WidgetContent {...props} />
          </div>
        </div>
      </Resizable>
    </>
  );
});
export default Widget;

export const PreviewWidget = observer((props: WidgetProps) => {
  const layout = useLayout();
  const { coords: { w, h } } = layout.widgets[props.uniqId] ?? { coords: { w: 1, h: 1 } };

  const { ref: dragRef } = useDraggable<IWidget>({
    id: props.uniqId,
    data: {
      uniqId: props.uniqId,
      pluginId: props.pluginId,
      widgetId: props.widgetId
    },
  });
  return (
    <div
      className="h-full w-full"
      style={{ width: `${100 * w}%`, height: `${100 * h}%`, aspectRatio: 1 }}
      ref={dragRef}
      data-uniq-id={props.uniqId}
    >
      <WidgetContent {...props} />
    </div>
  );
});

