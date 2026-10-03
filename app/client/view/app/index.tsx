import { useEffect, useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
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
  const [currentLayout, _setCurrentLayout] = useState(Object.keys(app.layout.data)[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    carouselApi?.reInit({ active: !isDragging });
  }, [carouselApi, isDragging]);
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
      <div className="relative">
        <Button className="absolute z-1 mt-2 ms-2" variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
      </div>
      <div className="flex h-full bg-background text-foreground min-h-screen antialiased p-2">
        <Menu
          open={!isDragging && isOpen}
          onOpenChange={setIsOpen}
          keepMounted={isDragging}
        />
        <Carousel className="grow" setApi={setCarouselApi}>
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
    </DragDropProvider>
  );
});
export default App;
