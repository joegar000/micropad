import { GridStackItem, GridStackProvider } from "../lib/gridstack-react";
import { Grid } from "./components/gridstack/Gridstack";
import { useLayoutStore } from "./store/layout";
import { widgetRegistry } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";
import "./components/gridstack/widgets";
import { Lock } from "./components/editing/lock";
import { GridSize } from "./components/editing/gridsize";

export default function App() {
  const widgets = useLayoutStore(s => s.widgets);
  const widgetMeta = useLayoutStore(s => s.widgetMeta);
  return (
    <GridStackProvider initialOptions={{ children: widgets }}>
      <Grid>
        {widgets.map((w) => {
          const Widget = widgetRegistry[widgetMeta[w.id!].type];
          return (
            <GridStackItem key={w.id} id={w.id!}>
              <Widget />
            </GridStackItem>
          );
        })}
      </Grid>
      <Lock />
      <Sidebar />
      <GridSize />
    </GridStackProvider>
  );
}