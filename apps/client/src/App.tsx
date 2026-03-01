import "./components/gridstack/widgets";
import { Gridstack } from "./components/gridstack";
import Sidebar from "./components/sidebar/Sidebar";

export default function App() {
  return (
    <>
      <Sidebar />
      <Gridstack />
    </>
  );
}