import { GridStackItem, GridStackProvider } from "../lib/gridstack-react";
import { Grid } from "./components/gridstack/Gridstack";
import { useLayoutStore } from "./store/layout";
import { widgetRegistry } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";
import "./components/gridstack/widgets";
import { Lock } from "./components/editing/lock";
import { GridSize } from "./components/editing/gridsize";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEditingStore } from "./store/editing";
import { Activity } from "react";
import { SidebarButton } from "./components/editing/sidebarbutton";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


export default function App() {
  const widgets = useLayoutStore(s => s.widgets);
  const widgetMeta = useLayoutStore(s => s.widgetMeta);
  const isEditing = useEditingStore(s => s.isEditing);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Activity mode={isEditing ? 'visible' : 'hidden'}>
        <div className="p-1 flex justify-between">
          <Lock />
          <SidebarButton />
        </div>
      </Activity>
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
        <Sidebar />
        <Activity mode={isEditing ? 'visible' : 'hidden'}>
          <div className="p-1">
            <GridSize />
          </div>
        </Activity>
      </GridStackProvider>
    </ThemeProvider>
  );
}