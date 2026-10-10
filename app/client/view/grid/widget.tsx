import { useCallback, useMemo, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";
import type LayoutModel from "../../model/layout.tsx";
import type { IWidget } from "../../../server/db/db.ts";
import { ResizableBox } from "react-resizable";
import { useCarousel } from "micropad-ui";
import useResizeObserver from "../../hooks/resize-observer.tsx";
import { usePage } from "../../model/page.tsx";
import 'react-resizable/css/styles.css';

export type WidgetProps = Pick<
  LayoutModel['data']['pages'][number]['widgets'][string],
  'uniqId' | 'pluginId' | 'widgetId'
>;
const Widget = observer((props: WidgetProps) => {
  const app = useApp();
  const page = usePage();
  const { api } = useCarousel();
  const plugin = app.plugins.find(p => p.displayName === props.pluginId)!;
  const widgetDom = useMemo(() => (
    plugin.createWidget(props.widgetId).dom
  ), [plugin, props.widgetId]);
  const [disableDrag, setDisableDrag] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { x, y, w, h } = page.data.widgetCoords[props.uniqId];

  useResizeObserver(resizeRef, () => {
    if (resizeRef.current && resizeRef.current.parentElement?.parentElement) {
      const rect = resizeRef.current.parentElement.parentElement.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
    }
  }, { waitUntilMounted: true });


  const { ref: dragRef } = useDraggable<IWidget>({
    id: props.uniqId,
    data: {
      uniqId: props.uniqId,
      pluginId: props.pluginId,
      widgetId: props.widgetId
    },
    disabled: disableDrag
  });
  return (
    <ResizableBox
      style={{ minWidth: '100%', minHeight: '100%' }}
      width={width * w}
      height={height * h}
      className="h-full border border-ring aspect-square p-1 rounded bg-secondary"
      onResizeStart={() => {
        setDisableDrag(true);
        api?.reInit({ watchDrag: false });
      }}
      onResizeStop={(_, resize) => {
        page.placeWidget(props, x, y, Math.round(resize.size.width / width), Math.round(resize.size.height / height));
        setDisableDrag(false);
        api?.reInit({ watchDrag: true });
      }}
    >
      <div
        className="h-full w-full flex justify-center items-center"
        ref={node => {
          dragRef(node);
          resizeRef.current = node;
        }}
        data-uniq-id={props.uniqId}
      >
        <div ref={useCallback(node => {
          node?.appendChild(widgetDom);
          return () => widgetDom.remove();
        }, [widgetDom])} />
      </div>
    </ResizableBox>
  )
});
export default Widget;

export const PreviewWidget = observer((props: WidgetProps) => {
  const app = useApp();
  const plugin = app.plugins.find(p => p.displayName === props.pluginId)!;
  const widgetDom = useMemo(() => (
    plugin.createWidget(props.widgetId).dom
  ), [plugin, props.widgetId]);

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
        className="h-full border border-ring aspect-square p-1 rounded flex justify-center items-center bg-secondary"
        ref={dragRef}
        data-uniq-id={props.uniqId}
      >
        <div ref={useCallback(node => {
          node?.appendChild(widgetDom);
          return () => widgetDom.remove();
        }, [widgetDom])} />
      </div>
  );
});

