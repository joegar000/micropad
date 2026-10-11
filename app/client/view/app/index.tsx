import { useEffect, useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  CarouselNext,
  CarouselPrevious,
  Input,
  CarouselAdd,
  Button
} from "micropad-ui";
import { PageModelContext } from "../../model/page.tsx";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { type Draggable } from "@dnd-kit/dom";
import type { CellData } from "../grid/cell";
import { WidgetContent } from "../grid/widget.tsx";
import { observer } from "mobx-react-lite";
import type { IWidget } from "../../../server/db/db.ts";
import Settings from "../menu/settings.tsx";
import { useHover } from "../../hooks/hover.tsx";
import clsx from "clsx";
import { LayoutModelContext } from "../../model/layout.tsx";
import LayoutSelector from "../menu/layout-selector.tsx";
import './styles.css'
import { useSyncedCarousel } from "../../hooks/synced-carousel.tsx";

const App = observer(() => {
  const app = useApp();
  const [currentLayout, setCurrentLayout] = useState<string | null>(app.layoutNames[0] ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [pageNum, setPageNum] = useSyncedCarousel(carouselApi);
  const [nextRef, overNext] = useHover();
  const [prevRef, overPrevious] = useHover();


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

  const layout = app.layoutLookup[currentLayout];
  return (
    <DragDropProvider
      onBeforeDragStart={event => {
        const rect = event.operation.source?.element?.getBoundingClientRect();
        if (!rect) return;
        document.body.style.setProperty('--overlay-width', `${rect!.width}px`);
        document.body.style.setProperty('--overlay-height', `${rect!.height}px`);
      }}
      onDragStart={_event => {
        setIsDragging(true);
      }}
      onDragOver={event => {
        const rect = event.operation.target?.element?.getBoundingClientRect();
        if (!rect) return;
        document.body.style.setProperty('--overlay-width', `${rect!.width}px`);
        document.body.style.setProperty('--overlay-height', `${rect!.height}px`);
      }}
      onDragEnd={event => {
        setIsDragging(false);

        const target = event.operation.target;
        const source = event.operation.source;
        if (!target || !source || event.canceled || !carouselApi) return;
        const { x, y } = target.data as CellData;
        layout.pages[pageNum].placeWidget(source.data as IWidget, x, y);
        document.body.style.removeProperty('--overlay-width');
        document.body.style.removeProperty('--overlay-height');
      }}
    >
      <LayoutModelContext value={layout}>
        <PageModelContext value={layout.pages[pageNum]}>
          <DragOverlay>
            {(source: Draggable<IWidget>) => (
              <div className="transition-all" style={{ width: 'var(--overlay-width)', height: 'var(--overlay-height)' }}>
                <WidgetContent {...source.data} />
              </div>
            )}
          </DragOverlay>
          <div className="flex flex-col h-full">
            <div className="py-2 ps-2 flex border-b border-b-secondary">
              <div className="p-2">
                <Settings />
              </div>
              <div className="p-2">
                <LayoutSelector currentLayout={currentLayout} onLayoutChange={(l) => {
                  if (l === null) return;
                  setCurrentLayout(l);
                  setPageNum(0);
                }} />
              </div>
              <div className="p-2 flex">
                <Input className="me-1" type="number" min={1} max={25} value={layout.pages[pageNum].data.columns}
                  onChange={e => {
                    layout.pages[pageNum].data.columns = Number(e.target.value);
                  }}
                />
                x
                <Input className="ms-1" type="number" min={1} max={25} value={layout.pages[pageNum].data.rows}
                  onChange={e => {
                    layout.pages[pageNum].data.rows = Number(e.target.value);
                  }}
                />
              </div>
              <div className="p-2">
                <Button variant="destructive" disabled={app.layouts.length === 1}
                  onClick={() => {
                    const layoutIndex = app.layoutNames.indexOf(currentLayout);
                    const nextLayout = app.layoutNames[layoutIndex === 0 ? layoutIndex + 1 : layoutIndex - 1];
                    setCurrentLayout(nextLayout);
                    setPageNum(0);
                    app.deleteLayout(currentLayout);
                  }}
                >
                  Delete Layout
                </Button>
              </div>
            </div>
            <div className="flex grow bg-background text-foreground antialiased p-2">
              <Carousel className="grow w-full h-full flex flex-row" setApi={setCarouselApi} opts={{ watchDrag: !isDragging }}>
                <div className={"relative z-1 flex h-full w-10 shrink-0 items-center ps-3"}
                  ref={prevRef}
                >
                  {pageNum !== 0 && <CarouselPrevious className={clsx("static scale-150", isDragging && "animate-horizontal-bounce-reverse")} />}
                </div>
                <CarouselContent>
                  {layout.pages.map((page, i) => (
                    <CarouselItem key={i} className="flex items-center justify-center">
                      <PageModelContext value={page}>
                        <Grid />
                      </PageModelContext>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="relative z-1 flex h-full w-10 shrink-0 items-center pe-3"
                  ref={nextRef}
                >
                  {pageNum === layout.pages.length - 1 && <CarouselAdd className={clsx("static scale-150", isDragging && "hidden")}
                    onClick={() => {
                      layout.addPage();
                      setTimeout(() => {
                        carouselApi?.scrollTo(layout.pages.length - 1);
                      }, 0);
                    }}
                  />}
                  {pageNum !== layout.pages.length - 1 && <CarouselNext className={clsx("static scale-150", isDragging && "animate-horizontal-bounce")} />}
                </div>
              </Carousel>
            </div>
            <div className="flex justify-center">
              <div className="p-2">
                <Button variant="destructive" disabled={layout.pages.length === 1}
                  onClick={() => {
                    if (pageNum === 0) {
                      layout.removePage(0);
                    } else if (pageNum === layout.pages.length - 1) {
                      layout.removePage(pageNum);
                      setPageNum(pageNum - 1);
                    } else {
                      layout.removePage(pageNum);
                    }
                  }}
                >
                  Delete Page
                </Button>
              </div>
              <div className="p-2">
                <Button variant="secondary"
                  onClick={() => {
                    layout.addPage(pageNum + 1);
                    setTimeout(() => {
                      carouselApi?.scrollTo(pageNum + 1);
                    }, 0);
                  }}
                >
                  Add Page
                </Button>
              </div>
            </div>
            <div className="mb-2 ms-2 flex justify-center">
              <div className="flex justify-center gap-2 py-2">
                {layout.pages.map((_, index) => (
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
        </PageModelContext>
      </LayoutModelContext>
    </DragDropProvider>
  );
});
export default App;
