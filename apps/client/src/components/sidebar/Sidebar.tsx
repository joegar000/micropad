import { useRef } from "react";
import Slide from "@mui/material/Slide";
import { Box } from "@mui/material";
import { useEditingStore } from "../../store/editing";
import clsx from "clsx";
import { GridPanel } from "../grid";

export default function Sidebar() {
  const boxRef = useRef<HTMLElement>(null);
  const sidebarOpen = useEditingStore(s => s.sidebarOpen);

  return (
    <>
      <Box ref={boxRef}>
        <Slide direction="left" in={sidebarOpen} container={boxRef.current}>
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
      </Box>
    </>
  );
}
