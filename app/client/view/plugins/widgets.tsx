import type { ClientPlugin } from "micropad-sdk/client";
import Widget from "../grid/widget.tsx";

export function WidgetsPreview(props: { plugin: ClientPlugin }) {
  return (
    <div className="flex">
      {props.plugin.widgetIds.map(wId => (
        <Widget pluginId={props.plugin.displayName} widgetId={wId} />
      ))}
    </div>
  );
}
