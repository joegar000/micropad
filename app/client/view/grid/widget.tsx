import { useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useApp } from "../../model/app";
import { observer } from "mobx-react-lite";
import type LayoutModel from "../../model/layout.tsx";
import type { IWidget } from "../../../server/db/db.ts";
import { usePage } from "../../model/page.tsx";

export type WidgetProps = Pick<
  LayoutModel['data']['pages'][number]['widgets'][string],
  'uniqId' | 'pluginId' | 'widgetId'
>;
const Widget = observer((props: WidgetProps) => {
  const app = useApp();
  const page = usePage();
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
  return (
    <div
      className="h-full border border-ring aspect-square p-1 rounded flex justify-center items-center bg-secondary"
      ref={dragRef}
      style={{ height: page.cellHeight }}
      data-uniq-id={props.uniqId}
    >
      <div ref={useCallback(node => {
        node?.appendChild(widgetDom);
        return () => widgetDom.remove();
      }, [widgetDom])} />
    </div>
  )
});
export default Widget;
