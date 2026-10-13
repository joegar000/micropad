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
import { useMemo, useState, type ReactNode } from "react";
import { useApp } from "../../model/app";
import { PreviewWidget } from "../grid/widget";
import { useLayout } from "../../model/layout";
import { useDragOperation } from "@dnd-kit/react";
import type { ClientPlugin } from "micropad-sdk/client";

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
  const [value, setValue] = useState<string>('device-settings');
  const isDragging = !!useDragOperation().source;
  const displayWidgets = useMemo(() => {
    const usedIds = new Set<string>();
    return app.plugins.reduce((lookup, p) => {
      lookup.set(p, p.widgetIds.map(wId => {
        let w = layout.newWidget(p, wId);
        while (usedIds.has(w.uniqId)) {
          w = layout.newWidget(p, wId);
        }
        usedIds.add(w.uniqId);
        return w;
      }));
      return lookup;
    }, new Map<ClientPlugin, ReturnType<typeof layout.newWidget>[]>);
  }, [layout.usedIds]);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
      <Dialog open={isOpen && !isDragging} onOpenChange={setIsOpen}>
        {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
        <DialogContent className="sm:max-w-4xl" keepMounted={isDragging}>
          <DialogTitle>Menu</DialogTitle>
          <div className="flex justify-between">
            <Tabs orientation="vertical" className="pb-2 grow" value={value} onValueChange={setValue}>
              <TabsList variant="line">
                <TabsTrigger className="ps-0" value={"device-settings"}>
                  <TabsHeader>Device Settings</TabsHeader>
                </TabsTrigger>
                <TabsHeader>Plugins</TabsHeader>
                {app.plugins.map(p => {
                  return (
                    <TabsTrigger className="justify-start text-left" key={p.displayName} value={p.displayName}>
                      {p.displayName}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <TabsContent className="ps-4" value="device-settings">
                hi
              </TabsContent>
              {app.plugins.map(p => (
                <TabsContent className="ps-4 flex flex-wrap gap-3" value={p.displayName}>
                  {displayWidgets.get(p)!.map(w => (
                    <div key={w.uniqId} style={{ width: '8rem' }}>
                      <PreviewWidget {...w} />
                    </div>
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

