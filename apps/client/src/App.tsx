import "./components/gridstack/widgets";
import { Gridstack, GridstackProvider } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";

export default function App() {
  return (
    <GridstackProvider>
      <Sidebar />
      <Gridstack />
    </GridstackProvider>
  );
}