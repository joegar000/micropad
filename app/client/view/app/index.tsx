import { useState } from "react";
import { useApp } from "../../model/app";
import Grid from "../grid";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem
} from "micropad-ui";
import { WidgetsPreview } from "../plugins/widgets";
import { PageModelContext } from "../../model/layout";

export default function App() {
  const app = useApp();
  const currentLayout = 'Micropad';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlugin, _setSelectedPlugin] = useState(app.plugins[0]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex h-full bg-background text-foreground min-h-screen antialiased p-2">
        <DialogTrigger render={<Button variant="outline">Menu</Button>} />
        {/* Change max-w-lg to max-w-4xl, max-w-5xl, or sm:max-w-[800px] */}
        <DialogContent className="sm:max-w-4xl">
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
    </Dialog>
  );
}
