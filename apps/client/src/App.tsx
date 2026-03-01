import "./components/gridstack/widgets";
import { Gridstack, GridstackProvider } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";

export default function App() {
  return (
    <GridstackProvider>
      <div className="h-screen w-screen relative">
        <Sidebar />
        <Gridstack />
      </div>
    </GridstackProvider>
  );
}