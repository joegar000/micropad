import { useRef } from "react";
import Slide from "@mui/material/Slide";
import { Box } from "@mui/material";
import { useEditingStore } from "../../store/editing";
import { useShallow } from "zustand/react/shallow";
import clsx from "clsx";
import { GridPanel } from "../grid";

export default function Sidebar() {
  const boxRef = useRef<HTMLElement>(null);
  const { sidebarOpen, setSidebarOpen } = useEditingStore(
    useShallow(s => ({ setSidebarOpen: s.setSidebarOpen, sidebarOpen: s.sidebarOpen })),
  );
  const isEditing = useEditingStore(s => s.isEditing);
  const setIsEditing = useEditingStore(s => s.setIsEditing);

  return (
    <>
      <Box ref={boxRef}>
        <Slide direction="left" in={sidebarOpen} container={boxRef.current} mountOnEnter unmountOnExit>
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
