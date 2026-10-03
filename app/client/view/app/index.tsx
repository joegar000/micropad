import { useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "micropad-ui";
import { PageModelContext } from "../../model/page.tsx";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { type Draggable } from "@dnd-kit/dom";
import type { CellData } from "../grid/cell";
import Widget from "../grid/widget.tsx";
import { observer } from "mobx-react-lite";
import type { IWidget } from "../../../server/db/db.ts";
import Menu from "../menu/index.tsx";

const App = observer(() => {
  const app = useApp();
  const selectItems = app.layout.layoutNames.map(name => ({ label: name, value: name }));
  const [currentLayout, setCurrentLayout] = useState<string | null>(selectItems[0]?.value ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // TODO: Add shadcn empty when no layouts available
  if (!currentLayout)
    return null;

  return (
    <DragDropProvider
      onDragStart={_event => {
        setIsDragging(true);
      }}
      onDragEnd={event => {
        setIsDragging(false);

        const target = event.operation.target;
        const source = event.operation.source;
        if (!target || !source || event.canceled) return;
        const { x, y } = target.data as CellData;
        app.layout.pagesLookup[currentLayout][0].placeWidget(source.data as IWidget, x, y);
      }}
    >
      <DragOverlay>
        {(source: Draggable<IWidget>) => <Widget {...source.data} />}
      </DragOverlay>
      <div className="flex flex-col h-full">
        <div className="z-1 mt-2 ms-2 flex">
          <div className="pe-2">
            <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
          </div>
          <div>
            <Select items={selectItems} value={currentLayout} onValueChange={v => setCurrentLayout(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {selectItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex grow bg-background text-foreground antialiased p-2">
          <Menu
            open={!isDragging && isOpen}
            onOpenChange={setIsOpen}
            keepMounted={isDragging}
          />
          <Carousel className="grow" opts={{ watchDrag: !isDragging }}>
            <CarouselContent>
              {app.layout.pagesLookup[currentLayout].map((page, i) => (
                <CarouselItem className="flex">
                  <PageModelContext key={i} value={page}>
                    <Grid />
                  </PageModelContext>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div >
    </DragDropProvider>
  );
});
export default App;
