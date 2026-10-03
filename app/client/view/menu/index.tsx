import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "micropad-ui";
import { type ReactNode } from "react";
import { useApp } from "../../model/app";
import Widget from "../grid/widget";

function TabsHeader(props: { children: ReactNode }) {
  return (
    <div className="shrink-0 text-foreground w-full pb-2">
      <h2 className="text-sm">{props.children}</h2>
    </div>
  );
}

const Menu = observer((props: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  keepMounted?: boolean
}) => {
  const app = useApp();
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
      <DialogContent className="sm:max-w-4xl" keepMounted={props.keepMounted}>
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
                  <Widget {...app.layout.newWidget(p, wId)} />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
});

export default Menu;

