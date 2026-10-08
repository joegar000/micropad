import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button
} from "micropad-ui";
import { useState, type ReactNode } from "react";
import { useApp } from "../../model/app";
import Widget from "../grid/widget";
import { useLayout } from "../../model/layout";
import { useDragOperation } from "@dnd-kit/react";

function TabsHeader(props: { children: ReactNode }) {
  return (
    <div className="shrink-0 text-foreground w-full pb-2">
      <h2 className="text-sm">{props.children}</h2>
    </div>
  );
}

const Settings = observer(() => {
  const app = useApp();
  const layout = useLayout();
  const [isOpen, setIsOpen] = useState(false);
  const isDragging = !!useDragOperation().source;
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
      <Dialog open={isOpen && !isDragging} onOpenChange={setIsOpen}>
        {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
        <DialogContent className="sm:max-w-4xl" keepMounted={isDragging}>
          <DialogTitle>Menu</DialogTitle>
          <div className="flex justify-between">
            <Tabs orientation="vertical" className="pb-2">
              <TabsList variant="line">
                <TabsHeader>Plugins</TabsHeader>
                {app.plugins.map(p => {
                  return (
                    <TabsTrigger className="justify-start text-left" key={p.displayName} value={p.displayName}>
                      {p.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {app.plugins.map(p => (
                <TabsContent className="ps-4" value={p.displayName}>
                  {p.widgetIds.map(wId => (
                    <Widget {...layout.newWidget(p, wId)} />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default Settings;

