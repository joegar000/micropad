import type { ClientPlugin } from "micropad-sdk/client";
import Widget from "../grid/widget.tsx";
import { usePage } from "../../model/page.tsx";
import { observer } from "mobx-react-lite";

export const WidgetsPreview = observer((props: { plugin: ClientPlugin }) => {
  const page = usePage();

  return (
    <div className="flex">
      {props.plugin.widgetIds.map(wId => (
        <Widget {...page.newWidget(props.plugin, wId)} />
      ))}
    </div>
  );
});

