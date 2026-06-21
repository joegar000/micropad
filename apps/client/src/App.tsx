import { Grid } from "./components/grid/Grid";
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
import { useLayoutStore } from "./store/layout-store";
import type { IWidgetModel } from "micropad-widgets";
import { AppSnapshotSchema, SocketEvent, type AppSnapshot } from "micropad-protocol";
import { AppActionProvider } from "./components/app-actions/AppActionProvider";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';


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
    socket.connect();
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
        <AppActionProvider>
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
        </AppActionProvider>
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
  const layout = useLayoutStore(s => s.layout);
  const addPage = useLayoutStore(s => s.addPage);
  const removePage = useLayoutStore(s => s.removePage);
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

  return (
    <>
      <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
        {layout.pages.map((p, i) => (
          <Slide key={p.id} direction={layout.currentPageId === p.id ? 'left' : 'right'} in={layout.currentPageId === p.id} mountOnEnter unmountOnExit>
            <div className="flex h-[100%] w-[100%]">
              <div className="flex items-center">something</div>
              <div className="flex-grow-1">
                <Grid>
                  {p.widgets.map((w) => {
                    return (
                      <div className="flex" key={w.id}>
                        <Widget id={w.id} />
                      </div>
                    );
                  })}
                </Grid>
              </div>
              <div className="flex items-center">
                <button className="" onClick={() => {
                  addPage(i + 1);
                }}>
                  Add Page
                </button>
              </div>
            </div>
          </Slide>
        ))}
      </Box>
      <Activity mode={isEditing ? 'visible' : 'hidden'}>
        <div className="flex">
          <div className="p-1">
            <GridSize />
          </div>
          <div className="p-1">
            <IconButton onClick={() => {
              removePage();
            }}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      </Activity>
    </>
  );
}
