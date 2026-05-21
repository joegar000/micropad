import { Grid } from "./components/grid/Grid";
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
import { GridsContext, useGrids } from "./store/layout/grid";
import type { IBaseWidgetModel } from "micropad-widgets";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const isEditing = useEditingStore(s => s.isEditing);
  const socket = useSocket();
  const [specs, setSpecs] = useState<IBaseWidgetModel[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on('app', (data: { widgets: IBaseWidgetModel[] }) => {
      console.log('received', data)
      setSpecs(data.widgets);
    });
    socket.emit('app.get');
    return () => {
      socket.off('app');
    }
  }, [socket]);

  return (
    // @ts-ignore
    <WidgetSpecContext.Provider value={specs.reduce((acc, spec) => { acc[spec.type] = spec; return acc; }, {})}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="p-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock />
          </div>
          <Activity mode={isEditing ? 'visible' : 'hidden'}>
            <SidebarButton />
          </Activity>
        </div>
        <AppGrid />
        <Sidebar />
      </ThemeProvider>
    </WidgetSpecContext.Provider>
  );
}

function AppGrid() {
  const isEditing = useEditingStore(s => s.isEditing);
  const grid = useGrids();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    useGrids.persist.onFinishHydration(() => {
      setLoaded(true);
    });
  }, []);
  if (!loaded) {
    return <div>Loading...</div>;
  }

  const widgets = grid.grids[0]?.widgets || [];
  return (
    <>
      <GridsContext.Provider value={grid}>
        <Grid>
          {widgets.map((w) => {
            return (
              <div className="flex" key={w.i}>
                <Widget id={w.i} />
              </div>
            );
          })}
        </Grid>
      </GridsContext.Provider>
      <Activity mode={isEditing ? 'visible' : 'hidden'}>
        <div className="p-1">
          <GridSize />
        </div>
      </Activity>
    </>
  );
}
