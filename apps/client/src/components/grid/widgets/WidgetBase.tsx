/* eslint-disable react-refresh/only-export-components */
import clsx from "clsx";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from "react";
import { useEditingStore } from "../../../store/editing-store";
import { CircularProgress } from "@mui/material";
import { WidgetSpecContext } from "./speclookup";
import "./widgetbase.css";
import { BaseWidgetViewModel, type IWidgetModel } from "micropad-widgets";
import { useLayoutStore } from "../../../store/layout-store";
import { WidgetOptionsMenu, type WidgetExtraOption } from "./WidgetOptionsMenu";
import { useAppActions } from "../../app-actions/AppActionContext";

type WidgetViewModelConstructor = typeof BaseWidgetViewModel;

export class WidgetRegistry {
  static baseWidgetRegistry: Map<string, FC<IWidgetModel>> = new Map();

  static bindViewModel<T extends IWidgetModel>(vm: WidgetViewModelConstructor, component: FC<T>) {
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

type WidgetRequestContextValue = {
  pending: boolean;
  beginRequest: () => void;
  completeRequest: () => void;
};

const WidgetRequestContext = createContext<WidgetRequestContextValue | null>(null);

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

export function BaseWidget(props: {
  children: ReactNode,
  spec: IWidgetModel,
  extraOptions?: WidgetExtraOption[]
}) {
  const id = use(WidgetIdContext);
  const spec = props.spec;

  const isEditing = useEditingStore(s => s.isEditing);
  const removeWidget = useLayoutStore(s => s.removeWidget);
  const { triggerWidgetMenuAction } = useAppActions();
  const [pending, setPending] = useState(false);
  const pendingTimeoutRef = useRef<number | undefined>(undefined);

  const completeRequest = useCallback(() => {
    if (pendingTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = undefined;
    }
    setPending(false);
  }, [setPending]);

  const beginRequest = useCallback(() => {
    setPending(true);
    if (pendingTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTimeoutRef.current);
    }
    pendingTimeoutRef.current = window.setTimeout(() => {
      setPending(false);
      pendingTimeoutRef.current = undefined;
    }, 5000);
  }, [setPending]);

  useEffect(() => completeRequest, [completeRequest]);

  const requestStatus = useMemo(() => ({
    pending,
    beginRequest,
    completeRequest
  }), [beginRequest, completeRequest, pending]);

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
            {id && (
              <WidgetOptionsMenu
                hidden={!isEditing}
                menuItems={spec.menuItems}
                extraOptions={props.extraOptions}
                onSelectMenuItem={item => {
                  triggerWidgetMenuAction({
                    spec,
                    menuItemId: item.id,
                    widgetInstanceId: id
                  });
                }}
                onDelete={() => removeWidget(id)}
              />
            )}
          </div>
        )}
        <div className={clsx("flex-grow-1 overflow-hidden", { "pointer-events-none": isEditing })}>
          {props.children}
        </div>
      </div>
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
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Component {...spec} />
    </WidgetIdContext.Provider>
  );
}
