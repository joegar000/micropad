import { useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";
import type LayoutModel from "../../model/layout.tsx";
import type { IWidget } from "../../../server/db/db.ts";

export type WidgetProps = Pick<
  LayoutModel['data'][string][number]['widgets'][number],
  'uniqId' | 'pluginId' | 'widgetId'
>;
const Widget = observer((props: WidgetProps) => {
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
