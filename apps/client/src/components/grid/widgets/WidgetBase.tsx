/* eslint-disable react-refresh/only-export-components */
import clsx from "clsx";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from "react";
import { useEditingStore } from "../../../store/editing-store";
import DeleteIcon from '@mui/icons-material/Delete';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  TextField
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { WidgetSpecContext } from "./speclookup";
import "./widgetbase.css";
import type { IWidgetModel, BaseWidgetViewModel, WidgetMenuModalAction } from "micropad-widgets";
import { useLayoutStore } from "../../../store/layout-store";
import { SocketEvent, type WidgetEvent } from "micropad-protocol";
import { useSocket } from "../../../socket";

export class WidgetRegistry {
  static baseWidgetRegistry: Map<string, FC<IWidgetModel>> = new Map();

  static bindViewModel<T extends IWidgetModel>(vm: typeof BaseWidgetViewModel, component: FC<T>) {
    if (this.baseWidgetRegistry.has(vm.id))
      throw Error(`A widget of type ${vm.id} already exists`);
    this.baseWidgetRegistry.set(vm.id, component as FC<IWidgetModel>);
    return this.baseWidgetRegistry;
  }

  static get(spec: IWidgetModel): FC<IWidgetModel> | undefined {
    return this.baseWidgetRegistry.get(spec.id);
  }
}

const WidgetIdContext = createContext<string | null>(null);

export const SpecContext = createContext<IWidgetModel | null>(null);

type WidgetRequestContextValue = {
  pending: boolean;
  beginRequest: () => void;
  completeRequest: () => void;
};

const WidgetRequestContext = createContext<WidgetRequestContextValue | null>(null);
const WidgetMenuContext = createContext<{ openMenuItem: (id: string) => void } | null>(null);

type ModalItem = {
  id: string;
  title: string;
  subtitle?: string;
  value?: unknown;
  config?: Record<string, unknown>;
  specPatch?: Record<string, unknown>;
};

export function useWidgetInstanceId() {
  return use(WidgetIdContext);
}

export function useWidgetRequestStatus() {
  const context = use(WidgetRequestContext);
  if (!context) {
    throw new Error("useWidgetRequestStatus must be used within BaseWidget");
  }
  return context;
}

export function useWidgetMenuActions() {
  const context = use(WidgetMenuContext);
  if (!context) {
    throw new Error("useWidgetMenuActions must be used within BaseWidget");
  }
  return context;
}

export function BaseWidget(props: {
  children: ReactNode,
  extraOptions?: { icon: ReactNode, onClick: () => void, title?: string }[]
}) {
  const id = use(WidgetIdContext);
  const spec = use(SpecContext)!;
  const socket = useSocket();

  const isEditing = useEditingStore(s => s.isEditing);
  const removeWidget = useLayoutStore(s => s.removeWidget);
  const page = useLayoutStore(s => s.currentPage);
  const widget = page.widgets.find(candidate => candidate.id === id);
  const setWidgetConfig = useLayoutStore(s => s.setWidgetConfig);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalAction, setModalAction] = useState<WidgetMenuModalAction | null>(null);
  const [modalItems, setModalItems] = useState<ModalItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalQuery, setModalQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pendingTimeoutRef = useRef<number | undefined>(undefined);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(v => !v);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const completeRequest = useCallback(() => {
    if (pendingTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = undefined;
    }
    setPending(false);
  }, []);

  const beginRequest = useCallback(() => {
    setPending(true);
    if (pendingTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTimeoutRef.current);
    }
    pendingTimeoutRef.current = window.setTimeout(() => {
      setPending(false);
      pendingTimeoutRef.current = undefined;
    }, 5000);
  }, []);

  useEffect(() => completeRequest, [completeRequest]);

  useEffect(() => {
    if (!modalAction) {
      return;
    }

    const applyItems = (data: WidgetEvent) => {
      if (data.widgetType !== spec.type || data.action !== modalAction.responseAction) {
        return;
      }

      const payload = data.payload as { items?: ModalItem[] };
      setModalItems(payload.items ?? []);
      setModalLoading(false);
    };

    socket.on(SocketEvent.WidgetEvent, applyItems);
    socket.emit(SocketEvent.WidgetEvent, {
      widgetType: spec.type,
      action: modalAction.requestAction,
      payload: {
        ...(modalAction.requestPayload ?? {}),
        config: widget?.config ?? {}
      },
      createdAt: new Date().toISOString()
    });

    return () => {
      socket.off(SocketEvent.WidgetEvent, applyItems);
    };
  }, [modalAction, socket, spec.type, widget?.config]);

  const requestStatus = useMemo(() => ({
    pending,
    beginRequest,
    completeRequest
  }), [beginRequest, completeRequest, pending]);

  const filteredModalItems = useMemo(() => {
    const query = modalQuery.trim().toLowerCase();
    if (!query) {
      return modalItems;
    }

    return modalItems.filter(item => (
      item.title.toLowerCase().includes(query) ||
      (item.subtitle ?? "").toLowerCase().includes(query)
    ));
  }, [modalItems, modalQuery]);

  const openModalAction = (action: WidgetMenuModalAction) => {
    setModalItems([]);
    setModalQuery("");
    setModalLoading(true);
    setModalAction(action);
  };

  const openMenuItem = (menuItemId: string) => {
    const menuItem = spec.menuItems?.find(candidate => candidate.id === menuItemId);
    if (menuItem?.action.type === "modal") {
      openModalAction(menuItem.action);
    }
  };

  const selectModalItem = (item: ModalItem) => {
    if (!id) {
      return;
    }

    const nextConfig = {
      ...(widget?.config ?? {}),
      ...(item.config ?? {})
    };

    if (modalAction?.configKey) {
      nextConfig[modalAction.configKey] = item.value ?? item;
    }

    if (item.specPatch) {
      nextConfig.specPatch = {
        ...((widget?.config?.specPatch as Record<string, unknown> | undefined) ?? {}),
        ...item.specPatch
      };
    }

    setWidgetConfig(id, nextConfig);
    setModalAction(null);
  };

  return (
    <WidgetRequestContext.Provider value={requestStatus}>
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
            {pending && (
              <div className="flex items-center">
                <CircularProgress size={14} thickness={5} />
              </div>
            )}
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
                {spec.menuItems?.map(item => (
                  <MenuItem
                    key={item.id}
                    onClick={() => {
                      handleClose();
                      if (item.action.type === "modal") {
                        openModalAction(item.action);
                      }
                    }}
                  >
                    {item.title}
                  </MenuItem>
                ))}
                {props.extraOptions?.map(opt => (
                  <MenuItem key={opt.title} onClick={handleClose}>
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
        <WidgetMenuContext.Provider value={{ openMenuItem }}>
          <div className={clsx("flex-grow-1 overflow-hidden", { "pointer-events-none": isEditing })}>
            {props.children}
          </div>
        </WidgetMenuContext.Provider>
      </div>
      <Dialog open={!!modalAction} onClose={() => setModalAction(null)} fullWidth maxWidth="xs">
        <DialogTitle>{modalAction?.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            placeholder={modalAction?.searchPlaceholder ?? "Search..."}
            value={modalQuery}
            onChange={event => setModalQuery(event.target.value)}
          />
          {modalLoading ? (
            <div className="flex items-center justify-center p-8">
              <CircularProgress size={24} />
            </div>
          ) : (
            <List dense>
              {filteredModalItems.map(item => (
                <ListItemButton
                  key={item.id}
                  onClick={() => selectModalItem(item)}
                >
                  <ListItemText primary={item.title} secondary={item.subtitle} />
                </ListItemButton>
              ))}
              {filteredModalItems.length === 0 && (
                <div className="p-4 text-sm text-neutral-400">No items found.</div>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </WidgetRequestContext.Provider>
  );
}

export function Widget(props: { id: string }) {
  const page = useLayoutStore(s => s.currentPage);
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
  if (!Component) {
    return null;
  }

  return (
    <WidgetIdContext.Provider value={props.id}>
      <SpecContext.Provider value={spec}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Component {...spec} />
      </SpecContext.Provider>
    </WidgetIdContext.Provider>
  );
}
