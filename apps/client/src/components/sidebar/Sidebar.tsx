import Slide from "@mui/material/Slide";
import { useEditingStore } from "../../store/editing-store";
import clsx from "clsx";
import { GridPanel } from "../grid";

export default function Sidebar() {
  const sidebarOpen = useEditingStore(s => s.sidebarOpen);

  return (
    <>
      <Slide direction="left" in={sidebarOpen}>
        <div
          className={clsx(
            'fixed', 'top-0', 'right-0',
            'h-full', 'w-80', 'bg-neutral-900',
            'text-neutral-100', 'shadow-xl', 'z-100'
          )}
          role="complementary"
        >
          <GridPanel />
        </div>
      </Slide>
    </>
  );
}
