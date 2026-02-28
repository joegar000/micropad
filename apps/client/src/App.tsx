import { useLayoutStore } from "./store/layout";
import { Widgets } from "./components/widgets/Registration";
import "./components/widgets";
import { Gridstack, GridstackProvider } from "./components/gridstack";

export default function App() {
  const widgets = useLayoutStore((state) => state.widgets);
  return (
    <GridstackProvider>
      <Gridstack>
        {widgets.map((w) => {
          const Widget = Widgets[w.type];
          return (
            <Widget
              key={w.id}
              id={w.id}
              x={w.x}
              y={w.y}
              w={w.w}
              h={w.h}
            />
          );
        })}
      </Gridstack>
    </GridstackProvider>
  );
}