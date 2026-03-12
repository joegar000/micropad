import clsx from "clsx";
import { createContext, use, useState, type FC, type ReactNode } from "react";
import "./widget.css";
import { useEditingStore } from "../../../store/editing";
import DeleteIcon from '@mui/icons-material/Delete';
import { useLayoutStore } from "../../../store/layout";
import { IconButton, Menu, MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface WidgetSpec {
  type: string;
  title?: string;
}

export interface WidgetProps {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children: React.ReactNode;
}

const WidgetId = createContext<string>("");

export function useWidgetId() {
  return use(WidgetId);
}

export function Widget(props: { children: ReactNode, type: string, title?: string }) {
  const isEditing = useEditingStore(s => s.isEditing);
  const layout = useLayoutStore(s => s.widgets);
  const layoutMeta = useLayoutStore(s => s.widgetMeta);
  const setLayout = useLayoutStore(s => s.setLayout);
  const setLayoutMeta = useLayoutStore(s => s.setLayoutMeta);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(v => !v);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  return (
    <div
      data-type={props.type}
      className={clsx(
        "m-2",
        "flex-grow-1",
        "overflow-hidden",
        "rounded-2xl",
        "bg-neutral-800/80",
        "backdrop-blur-md",
        "border border-neutral-700",
        "shadow-xl",
        "text-neutral-100",
        "flex",
        "flex-col",
        "justify-center"
      )}
    >
      {props.title && (
        <div className="flex">
          <div className="p-2 text-sm font-medium text-neutral-400">
            {props.title}
          </div>
          <div className={clsx("flex-grow-1 flex justify-end", { 'hidden': !isEditing })}>
            <IconButton
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <MenuItem onClick={handleClose}>
                <DeleteIcon />
              </MenuItem>
            </Menu>
          </div>
        </div>
      )}
      <div className={clsx("flex-grow-1 overflow-hidden", { "pointer-events-none": isEditing })}>
        {props.children}
      </div>
    </div>
  );
}

const widgetRegistry: Record<string, FC> = {};

export function registerWidget(type: string, component: FC<any>) {
  if (widgetRegistry[type])
    throw Error(`A widget named ${type} already exists`);
  widgetRegistry[type] = component;
}

export { widgetRegistry };
