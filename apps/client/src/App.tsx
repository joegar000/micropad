import { Grid } from "./components/grid/Grid";
import { useLayoutStore } from "./store/layout";
import { widgetRegistry } from "./components/grid";
import "./components/grid/widgets";
import { Lock } from "./components/editing/lock";
import { GridSize } from "./components/editing/gridsize";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEditingStore } from "./store/editing";
import { Activity } from "react";
import { SidebarButton } from "./components/editing/sidebarbutton";
import Sidebar from "./components/sidebar/Sidebar";

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
      <div className="p-1 flex justify-between">
        <Lock />
        <Activity mode={isEditing ? 'visible' : 'hidden'}>
          <SidebarButton />
        </Activity>
      </div>
      <Grid>
        {widgets.map((w) => {
          const Widget = widgetRegistry[widgetMeta[w.i!].type];
          return (
            <div className="flex" key={w.i}>
              <Widget />
            </div>
          );
        })}
      </Grid>
      <Sidebar />
      <Activity mode={isEditing ? 'visible' : 'hidden'}>
        <div className="p-1">
          <GridSize />
        </div>
      </Activity>
    </ThemeProvider>
  );
}