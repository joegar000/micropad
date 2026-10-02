import type { ClientPlugin } from "micropad-sdk/client";
import Widget, { type WidgetProps } from "../grid/widget.tsx";

function fauxWidget(plugin: ClientPlugin, widgetId: string): WidgetProps {
  return {
    uniqId: `${Math.random()}`.replace('0.', ''),
    pluginId: plugin.displayName,
    widgetId: widgetId
  }
}

export function WidgetsPreview(props: { plugin: ClientPlugin }) {
  return (
    <div className="flex">
      {props.plugin.widgetIds.map(wId => (
        <Widget {...fauxWidget(props.plugin, wId)} />
      ))}
    </div>
  );
}
