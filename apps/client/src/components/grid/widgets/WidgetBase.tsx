import clsx from "clsx";
import { createContext, use, useState, type FC, type ReactNode } from "react";
import { useEditingStore } from "../../../store/editing";
import DeleteIcon from '@mui/icons-material/Delete';
import { useLayoutStore } from "../../../store/layout";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { WidgetSpecContext } from "./speclookup";
import "./widgetbase.css";
import { cloneDeep } from "es-toolkit";
import { type IWidgetSpec } from "micropad-widgets";

export const baseWidgetRegistry: Map<string, FC<IWidgetSpec>> = new Map();

export function registerWidget(type: string, component: FC<any>) {
  if (baseWidgetRegistry.has(type))
    throw Error(`A widget of type ${type} already exists`);
  baseWidgetRegistry.set(type, component);
  return baseWidgetRegistry;
}

const WidgetIdContext = createContext<string | null>(null);

export const SpecContext = createContext<IWidgetSpec | null>(null);

export function BaseWidget(props: {
  children: ReactNode,
  extraOptions?: { icon: ReactNode, onClick: () => void, title?: string }[]
}) {
  const id = use(WidgetIdContext);
  const spec = use(SpecContext)!;

  const isEditing = useEditingStore(s => s.isEditing);
  const setLayout = useLayoutStore(s => s.setLayout);
  const setLayoutMeta = useLayoutStore(s => s.setLayoutMeta)
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
      data-type={spec.type}
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
      {spec.title && (
        <div className="flex">
          <div className="p-2 text-sm font-medium text-neutral-400">
            {spec.title}
          </div>
          {id && <div className={clsx("flex-grow-1 flex justify-end", { 'hidden': !isEditing })}>
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
                vertical: 'center',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              {props.extraOptions?.map(opt => (
                <MenuItem onClick={handleClose}>
                  <div title={opt.title} onClick={opt.onClick}>
                    {opt.icon}
                  </div>
                </MenuItem>
              ))}
              <MenuItem onClick={handleClose}>
                <div
                  title="Delete"
                  onClick={() => {
                    setLayout(l => l.filter(w => w.i !== id));
                    setLayoutMeta(currentMeta => {
                      const newMeta = cloneDeep(currentMeta);
                      delete newMeta[id];
                      return newMeta;
                    })
                }}
                >
                  <DeleteIcon />
                </div>
              </MenuItem>
            </Menu>
          </div>}
        </div>
      )}
      <div className={clsx("flex-grow-1 overflow-hidden", { "pointer-events-none": isEditing })}>
        {props.children}
      </div>
    </div>
  );
}

export function Widget(props: { id: string }) {
  const layoutMeta = useLayoutStore(s => s.widgetMeta);
  const meta = layoutMeta[props.id];
  const specLookup = use(WidgetSpecContext);
  const spec = specLookup[meta.type];
  const Component = baseWidgetRegistry.get(spec.baseType)!;
  return (
    <WidgetIdContext.Provider value={props.id}>
      <SpecContext.Provider value={spec}>
        <Component {...spec} />
      </SpecContext.Provider>
    </WidgetIdContext.Provider>
  );
}
