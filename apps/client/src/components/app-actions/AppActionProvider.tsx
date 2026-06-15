import { useCallback, useMemo, useState, type ReactNode } from "react";
import { WidgetRuntime, type ModalItem, type WidgetMenuModalAction, type WidgetModalResponse } from "micropad-widgets";
import { useSocket } from "../../socket";
import { useLayoutStore } from "../../store/layout-store";
import { AppActionModal } from "./AppActionModal";
import { AppActionContext, type TriggerWidgetMenuActionInput } from "./AppActionContext";

type ActiveModalAction = {
  action: WidgetMenuModalAction;
  widgetInstanceId: string;
  widgetConfig: Record<string, unknown>;
  items: ModalItem[];
  loading: boolean;
};

function applyModalSelection(
  action: WidgetMenuModalAction,
  item: ModalItem,
  widgetConfig: Record<string, unknown>
) {
  const nextConfig = {
    ...widgetConfig,
    ...(item.config ?? {})
  };

  if (action.configKey) {
    nextConfig[action.configKey] = item.value ?? item;
  }

  if (item.specPatch) {
    nextConfig.specPatch = {
      ...((widgetConfig.specPatch as Record<string, unknown> | undefined) ?? {}),
      ...item.specPatch
    };
  }

  return nextConfig;
}

export function AppActionProvider(props: { children: ReactNode }) {
  const socket = useSocket();
  const page = useLayoutStore(s => s.currentPage);
  const setWidgetConfig = useLayoutStore(s => s.setWidgetConfig);
  const [activeModal, setActiveModal] = useState<ActiveModalAction | null>(null);

  const triggerWidgetMenuAction = useCallback((input: TriggerWidgetMenuActionInput) => {
    if (!input.widgetInstanceId) {
      return;
    }

    const runtime = new WidgetRuntime(input.spec);
    const menuItem = runtime.menuItem(input.menuItemId);
    if (!menuItem) {
      return;
    }

    const widget = page.widgets.find(candidate => candidate.id === input.widgetInstanceId);
    const widgetConfig = widget?.config ?? {};

    if (menuItem.spec.action.type === "modal") {
      const action = menuItem.spec.action;
      setActiveModal({
        action,
        widgetInstanceId: input.widgetInstanceId,
        widgetConfig,
        items: [],
        loading: true
      });

      menuItem.emit<Record<string, unknown>, WidgetModalResponse>(
        socket,
        {
          ...(action.requestPayload ?? {}),
          config: widgetConfig
        },
        { widgetInstanceId: input.widgetInstanceId },
        response => {
          setActiveModal(current => {
            if (!current || current.widgetInstanceId !== input.widgetInstanceId || current.action !== action) {
              return current;
            }

            return {
              ...current,
              items: response.items ?? [],
              loading: false
            };
          });
        }
      );
    }
  }, [page.widgets, socket]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const selectModalItem = useCallback((item: ModalItem) => {
    if (!activeModal) {
      return;
    }

    setWidgetConfig(
      activeModal.widgetInstanceId,
      applyModalSelection(activeModal.action, item, activeModal.widgetConfig)
    );
    setActiveModal(null);
  }, [activeModal, setWidgetConfig]);

  const value = useMemo(() => ({
    triggerWidgetMenuAction
  }), [triggerWidgetMenuAction]);

  return (
    <AppActionContext.Provider value={value}>
      {props.children}
      <AppActionModal
        key={activeModal?.widgetInstanceId ?? "closed"}
        action={activeModal?.action ?? null}
        items={activeModal?.items ?? []}
        loading={activeModal?.loading ?? false}
        onClose={closeModal}
        onSelect={selectModalItem}
      />
    </AppActionContext.Provider>
  );
}
