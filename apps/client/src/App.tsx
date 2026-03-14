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
import type { ButtonSpec, DialSpec, SliderSpec } from "./components/grid/widgets";
import { WidgetSpecContext } from "./components/grid/widgets/speclookup";
import { Widget } from "./components/grid";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const testWidgets: { [type: `${string}.${string}`]: (ButtonSpec | DialSpec | SliderSpec) } = {
  ['p1.btn1']: {
    baseType: 'button',
    type: 'p1.btn1',
    text: 'hello!',
    endpoint: '/#',
    title: 'greeting'
  },
  ['p1.btn2']: {
    baseType: 'button',
    type: 'p1.btn2',
    text: 'goodbye!',
    endpoint: '/#',
    title: 'farewell!'
  },
  ['p2.slider2']: {
    baseType: 'slider',
    type: 'p2.slider2',
    endpoint: '/#',
    title: 'slidin\' around',
  },
  ['p3.dial3']: {
    baseType: 'dial',
    type: 'p3.dial3',
    endpoint: '/#',
    title: 'the dial'
  }
};

export default function App() {
  const widgets = useLayoutStore(s => s.widgets);
  const isEditing = useEditingStore(s => s.isEditing);
  return (
    <WidgetSpecContext.Provider value={testWidgets}>
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