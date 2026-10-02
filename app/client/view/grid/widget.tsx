import { useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";

export type WidgetData = {
  pluginId: string;
  widgetId: string;
};

const Widget = observer((props: { pluginId: string, widgetId: string }) => {
  const app = useApp();
  const plugin = app.plugins.find(p => p.displayName === props.pluginId)!;
  const widgetDom = useMemo(() => (
    plugin.createWidget(props.widgetId).dom
  ), [plugin, props.widgetId]);

  const { ref: dragRef } = useDraggable<WidgetData>({
    id: props.widgetId,
    data: {
      pluginId: props.pluginId,
      widgetId: props.widgetId
    }
  });
  const cellHeight = app.layout.cellHeight;
  return (
    <div
      className="h-full border aspect-square p-1 rounded flex justify-center items-center"
      ref={dragRef}
      style={{ height: cellHeight }}
    >
      <div ref={useCallback(node => {
        node?.appendChild(widgetDom);
        return () => widgetDom.remove();
      }, [widgetDom])} />
    </div>
  )
});
export default Widget;
