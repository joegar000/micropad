import { Grid } from "./components/grid/Grid";
import { useLayoutStore } from "./store/layout";
import "./components/grid/widgets";
import { Lock } from "./components/editing/lock";
import { GridSize } from "./components/editing/gridsize";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEditingStore } from "./store/editing";
import { Activity } from "react";
import { SidebarButton } from "./components/editing/sidebarbutton";
import Sidebar from "./components/sidebar/Sidebar";
import { WidgetSpecContext } from "./components/grid/widgets/speclookup";
import { Widget } from "./components/grid";
import { useSocket } from "./socket";
import { useEffect, useState } from "react";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const widgets = useLayoutStore(s => s.widgets);
  const isEditing = useEditingStore(s => s.isEditing);
  const socket = useSocket();
  const [specs, setSpecs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!socket) return;
    socket.on('widgets', (data) => {
      setSpecs(data.widgets);
    });
    return () => {
      socket.off('widgets');
    };
  }, [socket]);

  return (
    <WidgetSpecContext.Provider value={specs}>
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
            return (
              <div className="flex" key={w.i}>
                <Widget id={w.i} />
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
    </WidgetSpecContext.Provider>
  );
}