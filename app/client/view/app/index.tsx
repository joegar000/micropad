import { useEffect, useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  CarouselNext,
  CarouselPrevious
} from "micropad-ui";
import { PageModelContext } from "../../model/page.tsx";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { type Draggable } from "@dnd-kit/dom";
import type { CellData } from "../grid/cell";
import Widget from "../grid/widget.tsx";
import { observer } from "mobx-react-lite";
import type { IWidget } from "../../../server/db/db.ts";
import Menu from "../menu/index.tsx";
import AddLayout from "./add-layout.tsx";
import { useHover } from "../../hooks/hover.tsx";
import clsx from "clsx";
import { LayoutModelContext } from "../../model/layout.tsx";

const App = observer(() => {
  const app = useApp();
  const selectItems = app.layoutNames.map(name => ({ label: name, value: name }));
  const [currentLayout, setCurrentLayout] = useState<string | null>(selectItems[0]?.value ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [showAddLayout, setShowAddLayout] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [pageNum, setPageNum] = useState(0);
  const [nextRef, overNext] = useHover();
  const [prevRef, overPrevious] = useHover();

  useEffect(() => {
    const cb = () => setPageNum(carouselApi?.selectedScrollSnap() ?? 0);
    carouselApi?.on('select', cb);
    return () => void carouselApi?.off('select', cb);
  }, [carouselApi]);

  useEffect(() => {
    if (overNext && isDragging) {
      carouselApi?.scrollNext();
      const interval = setInterval(() => {
        carouselApi?.scrollNext();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [overNext, isDragging]);

  useEffect(() => {
    if (overPrevious && isDragging) {
      carouselApi?.scrollPrev();
      const interval = setInterval(() => {
        carouselApi?.scrollPrev();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [overPrevious, isDragging]);

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
        if (!target || !source || event.canceled || !carouselApi) return;
        const { x, y } = target.data as CellData;
        app.layoutLookup[currentLayout].pages[pageNum].placeWidget(source.data as IWidget, x, y);
      }}
    >
      <DragOverlay>
        {(source: Draggable<IWidget>) => <Widget {...source.data} />}
      </DragOverlay>
      <LayoutModelContext value={app.layoutLookup[currentLayout]}>
        <div className="flex flex-col h-full">
          <div className="mt-2 ms-2 flex">
            <Button onClick={() => {
              app.layoutLookup[currentLayout].addPage();
              setTimeout(() => {
                carouselApi?.scrollTo(app.layoutLookup[currentLayout].pages.length - 1);
              }, 0);
            }}>add page</Button>
            <div className="pe-2">
              <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>Menu</Button>
            </div>
            <div>
              <Select open={selectOpen} onOpenChange={setSelectOpen}
                items={selectItems} value={currentLayout}
                onValueChange={setCurrentLayout}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {selectItems.map(item => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <Button variant="ghost" className="w-full justify-start text-left mb-1"
                      onClick={() => {
                        setSelectOpen(false);
                        setShowAddLayout(true);
                      }}
                    >
                      + Add layout
                    </Button>
                    <AddLayout open={showAddLayout} onOpenChange={setShowAddLayout}
                      onSave={newLayout => {
                        if (app.addLayout(newLayout))
                          setCurrentLayout(newLayout);
                      }}
                    />
                  </SelectGroup>
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
            <Carousel className="grow w-full flex flex-row" setApi={setCarouselApi} opts={{ watchDrag: !isDragging }}>
              <div className={"relative z-1 h-full flex items-center ps-3"}
                ref={prevRef}
              >
                <CarouselPrevious className={clsx("static", isDragging ? "scale-300 ms-3" : "scale-150")} />
              </div>
              <CarouselContent>
                {app.layoutLookup[currentLayout].pages.map((page, i) => (
                  <CarouselItem key={i} className="flex">
                    <PageModelContext value={page}>
                      <Grid />
                    </PageModelContext>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="relative z-1 h-full flex items-center pe-3"
                ref={nextRef}
              >
                <CarouselNext className={clsx("static", isDragging ? "scale-300 me-3" : "scale-150")} />
              </div>
            </Carousel>
          </div>
          <div className="mb-2 ms-2 flex justify-center">
            <div className="flex justify-center gap-2 py-2">
              {Array.from({ length: app.layoutLookup[currentLayout].pages.length }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${index === pageNum ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
                  onClick={() => carouselApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </LayoutModelContext>
    </DragDropProvider>
  );
});
export default App;
