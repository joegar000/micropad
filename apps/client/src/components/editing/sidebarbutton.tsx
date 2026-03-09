import clsx from "clsx";
import { useEditingStore } from "../../store/editing";
import { Button } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

export function SidebarButton() {
	const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);
  return (
    <div>
      <Button
        onClick={() => setSidebarOpen(v => !v)}
        className={clsx("bg-neutral-800 text-white")}
        aria-label="Open widgets"
      >
        <MenuIcon />
      </Button>
    </div>
  );
}