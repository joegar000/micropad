import { GridStackItem, GridStackProvider } from "../lib/gridstack-react";
import { Grid } from "./components/gridstack/Gridstack";
import { useLayoutStore } from "./store/layout";
import { widgetRegistry } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";
import "./components/gridstack/widgets";

export default function App() {
  const widgets = useLayoutStore(s => s.widgets);
  const widgetMeta = useLayoutStore(s => s.widgetMeta);
  return (
    <GridStackProvider initialOptions={{ children: widgets }}>
      <Grid>
        {widgets.map((w) => {
          const Widget = widgetRegistry[widgetMeta[w.id].type];
          return (
            <GridStackItem key={w.id} id={w.id}>
              <Widget />
            </GridStackItem>
          );
        })}
      </Grid>
      <Sidebar />
    </GridStackProvider>
  );
}