import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "micropad-ui";
import { useState } from "react";
import { useApp } from "../../model/app";
import Widget from "../grid/widget";

const Menu = observer((props: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  keepMounted?: boolean
}) => {
  const app = useApp();
  const [selectedPlugin, _setSelectedPlugin] = useState(app.plugins[0]);
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
      <DialogContent className="sm:max-w-4xl" keepMounted={props.keepMounted}>
        <div className="flex justify-between">
          <div>
            <DialogTitle>Plugins</DialogTitle>
            <div className="pt-2 pb-4">
              {app.plugins.map(p => {
                return (
                  <div>
                    {p.displayName}
                  </div>
                );
              })}
            </div>
            <DialogTitle>Something else</DialogTitle>
          </div>
          <div className="grow px-4">
            <div className="flex">
              {selectedPlugin.widgetIds.map(wId => (
                <Widget {...app.layout.newWidget(selectedPlugin, wId)} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
});

export default Menu;

