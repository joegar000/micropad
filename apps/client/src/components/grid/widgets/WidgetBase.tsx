/* eslint-disable react-refresh/only-export-components */
import clsx from "clsx";
import { createContext, use, useState, type FC, type ReactNode } from "react";
import { useEditingStore } from "../../../store/editing-store";
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { WidgetSpecContext } from "./speclookup";
import "./widgetbase.css";
import type { IWidgetModel, BaseWidgetViewModel } from "micropad-widgets";
import { selectCurrentPage, useLayoutStore } from "../../../store/layout-store";

export class WidgetRegistry {
  static baseWidgetRegistry: Map<string, FC<IWidgetModel>> = new Map();

  static bindViewModel<T extends IWidgetModel>(vm: typeof BaseWidgetViewModel, component: FC<T>) {
    if (this.baseWidgetRegistry.has(vm.id))
      throw Error(`A widget of type ${vm.id} already exists`);
    this.baseWidgetRegistry.set(vm.id, component as FC<IWidgetModel>);
    return this.baseWidgetRegistry;
  }

  static get(spec: IWidgetModel): FC<IWidgetModel> {
    return this.baseWidgetRegistry.get(spec.id)!;
  }
}

const WidgetIdContext = createContext<string | null>(null);

export const SpecContext = createContext<IWidgetModel | null>(null);

export function useWidgetInstanceId() {
  return use(WidgetIdContext);
}

export function BaseWidget(props: {
  children: ReactNode,
  extraOptions?: { icon: ReactNode, onClick: () => void, title?: string }[]
}) {
  const id = use(WidgetIdContext);
  const spec = use(SpecContext)!;

  const isEditing = useEditingStore(s => s.isEditing);
  const removeWidget = useLayoutStore(s => s.removeWidget);
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
                    removeWidget(id);
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
  const page = useLayoutStore(selectCurrentPage);
  const widget = page.widgets.find(candidate => candidate.id === props.id);
  const specLookup = use(WidgetSpecContext);
  if (!widget) {
    return null;
  }

  const spec = specLookup[widget.widgetType] as IWidgetModel | undefined;
  if (!spec) {
    return null;
  }

  const Component = WidgetRegistry.get(spec);
  return (
    <WidgetIdContext.Provider value={props.id}>
      <SpecContext.Provider value={spec}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Component {...spec} />
      </SpecContext.Provider>
    </WidgetIdContext.Provider>
  );
}
