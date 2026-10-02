import { useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem
} from "micropad-ui";
import { WidgetsPreview } from "../plugins/widgets";
import { PageModelContext } from "../../model/layout";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { type Draggable } from "@dnd-kit/dom";
import type { CellData } from "../grid/cell";
import type { WidgetData } from "../grid/widget";
import Widget from "../grid/widget.tsx";
import { observer } from "mobx-react-lite";

const App = observer(() => {
  const app = useApp();
  const [currentLayout, _setCurrentLayout] = useState(Object.keys(app.layout.data)[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPlugin, _setSelectedPlugin] = useState(app.plugins[0]);
  const [sourceData, setSourceData] = useState<WidgetData | null>(null);
  return (
    <DragDropProvider
      onDragStart={event => {
        setIsDragging(true);
        setSourceData((event.operation.source?.data as WidgetData) ?? null);
      }}
      onDragEnd={event => {
        setIsDragging(false);
        setSourceData(null);

        const target = event.operation.target;
        if (!target || !sourceData) return;
        const { x, y } = target.data as CellData;
        app.layout.data[currentLayout][0].widgets.push({
          x, y,
          w: 1, h: 1,
          ...(sourceData as WidgetData),
          // TODO: Robust ids
          uniqId: `${Math.random()}`.replace('0.', '')
        });
      }}
    >
      <DragOverlay>
        {(source: Draggable<WidgetData>) => <Widget {...source.data} />}
      </DragOverlay>
      <div className="relative pt-2 ps-2">
        <Button className="absolute z-1" variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
      </div>
      <div className="flex h-full bg-background text-foreground min-h-screen antialiased p-2">
        <Dialog open={!isDragging && isOpen} onOpenChange={setIsOpen}>
          {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
          <DialogContent className="sm:max-w-4xl" keepMounted={isDragging}>
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
                <WidgetsPreview plugin={selectedPlugin} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Carousel className="grow">
          <CarouselContent>
            {app.layout.data[currentLayout].map((page, i) => (
              <CarouselItem className="flex">
                <PageModelContext key={i} value={page}>
                  <Grid />
                </PageModelContext>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </DragDropProvider>
  );
});
export default App;
