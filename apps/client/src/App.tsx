import { Grid } from "./components/grid/Grid";
import "./components/grid/widgets";
import { Lock } from "./components/editing/lock";
import { GridSize } from "./components/editing/gridsize";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEditingStore } from "./store/editing-store";
import { Activity } from "react";
import { SidebarButton } from "./components/editing/sidebarbutton";
import Sidebar from "./components/sidebar/Sidebar";
import { WidgetSpecContext } from "./components/grid/widgets/speclookup";
import { Widget } from "./components/grid";
import { useSocket } from "./socket";
import { useEffect, useState } from "react";
import { selectCurrentPage, useLayoutStore } from "./store/layout-store";
import type { IWidgetModel } from "micropad-widgets";
import { AppSnapshotSchema, SocketEvent, type AppSnapshot } from "micropad-protocol";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const isEditing = useEditingStore(s => s.isEditing);
  const socket = useSocket();
  const [specs, setSpecs] = useState<IWidgetModel[]>([]);
  const setLayoutFromBridge = useLayoutStore(s => s.setLayoutFromBridge);
  const markBridgeReady = useLayoutStore(s => s.markBridgeReady);

  useEffect(() => {
    if (!socket) return;
    const applySnapshot = (data: AppSnapshot) => {
      const snapshot = AppSnapshotSchema.parse(data);
      setSpecs(snapshot.widgets as IWidgetModel[]);
      if (snapshot.layout) {
        setLayoutFromBridge(snapshot.layout);
      } else {
        markBridgeReady();
      }
    };

    const requestSnapshot = () => {
      socket.emit(SocketEvent.AppGet);
    };

    socket.on(SocketEvent.AppSnapshot, applySnapshot);
    socket.on('app', applySnapshot);
    socket.on('connect', requestSnapshot);
    requestSnapshot();
    return () => {
      socket.off(SocketEvent.AppSnapshot, applySnapshot);
      socket.off('app', applySnapshot);
      socket.off('connect', requestSnapshot);
    }
  }, [socket, markBridgeReady, setLayoutFromBridge]);

  return (
    <WidgetSpecContext.Provider value={specs.reduce<Record<string, IWidgetModel>>((acc, spec) => { acc[spec.type] = spec; return acc; }, {})}>
      <ThemeProvider theme={darkTheme}>
        <LayoutBridgeSync />
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

function LayoutBridgeSync() {
  const socket = useSocket();
  const layout = useLayoutStore(s => s.layout);
  const bridgeReady = useLayoutStore(s => s.bridgeReady);

  useEffect(() => {
    if (!bridgeReady) {
      return;
    }

    const sync = window.setTimeout(() => {
      socket.emit(SocketEvent.LayoutUpdate, layout);
    }, 250);

    return () => window.clearTimeout(sync);
  }, [bridgeReady, layout, socket]);

  return null;
}

function AppGrid() {
  const isEditing = useEditingStore(s => s.isEditing);
  const page = useLayoutStore(selectCurrentPage);
  const [loaded, setLoaded] = useState(useLayoutStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useLayoutStore.persist.onFinishHydration(() => {
      setLoaded(true);
    });
    return unsub;
  }, []);
  if (!loaded) {
    return <div>Loading...</div>;
  }

  const widgets = page.widgets;
  return (
    <>
      <Grid>
        {widgets.map((w) => {
          return (
            <div className="flex" key={w.id}>
              <Widget id={w.id} />
            </div>
          );
        })}
      </Grid>
      <Activity mode={isEditing ? 'visible' : 'hidden'}>
        <div className="p-1">
          <GridSize />
        </div>
      </Activity>
    </>
  );
}
