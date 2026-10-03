import type { ClientPlugin } from "micropad-sdk/client";
import Widget from "../grid/widget.tsx";
import { observer } from "mobx-react-lite";
import { useLayout } from "../../model/layout.tsx";

export const WidgetsPreview = observer((props: { plugin: ClientPlugin }) => {
  const layout = useLayout();

  return (
    <div className="flex">
      {props.plugin.widgetIds.map(wId => (
        <Widget {...layout.newWidget(props.plugin, wId)} />
      ))}
    </div>
  );
});

