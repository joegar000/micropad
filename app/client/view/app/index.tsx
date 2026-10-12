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
import { observer } from "mobx-react-lite";
import Settings from "../menu/settings.tsx";
import { useHover } from "../../hooks/hover.tsx";
import clsx from "clsx";
import { LayoutModelContext } from "../../model/layout.tsx";
import LayoutSelector from "../menu/layout-selector.tsx";
import './styles.css'
import { useSyncedCarousel } from "../../hooks/synced-carousel.tsx";
import DragProvider from "./drag-provider.tsx";


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
    <LayoutModelContext value={layout}>
      <PageModelContext value={layout.pages[pageNum]}>
        <DragProvider
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          <div className="flex flex-col h-full">
            <div className="py-1 ps-2 flex border-b border-b-secondary">
              <div className="px-2">
                <Settings />
              </div>
              <div className="px-2">
                <LayoutSelector currentLayout={currentLayout} onLayoutChange={(l) => {
                  if (l === null) return;
                  setCurrentLayout(l);
                  setPageNum(0);
                }} />
              </div>
              <div className="px-2">
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
            <div className="flex grow bg-background text-foreground antialiased pt-1">
              <Carousel className="grow w-full h-full flex flex-row" setApi={setCarouselApi} opts={{ watchDrag: !isDragging }}>
                <div className={"relative z-1 flex h-full w-10 shrink-0 items-center ps-3"}
                  ref={prevRef}
                >
                  {pageNum !== 0 && <CarouselPrevious className={clsx("static scale-150", isDragging && "animate-horizontal-bounce-reverse")} />}
                </div>
                <CarouselContent className="px-2">
                  {layout.pages.map((page, i) => (
                    <CarouselItem key={i} className="flex items-center justify-center">
                      <PageModelContext value={page}>
                        <div className="flex flex-col h-full w-full">
                          <div className="flex justify-center pb-1">
                            <div className="px-2 flex">
                              <Input className="me-1" type="number" min={1} max={25} value={layout.pages[pageNum].data.columns}
                                onChange={e => {
                                  page.data.columns = Number(e.target.value);
                                }}
                              />
                              x
                              <Input className="ms-1" type="number" min={1} max={25} value={layout.pages[pageNum].data.rows}
                                onChange={e => {
                                  page.data.rows = Number(e.target.value);
                                }}
                              />
                            </div>
                            <div className="px-2">
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
                            <div className="px-2">
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
                          </div>
                          <div className="grow">
                            <Grid />
                          </div>
                        </div>
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
            <div className="ms-2 flex justify-center">
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
        </DragProvider>
      </PageModelContext>
    </LayoutModelContext>
  );
});
export default App;
