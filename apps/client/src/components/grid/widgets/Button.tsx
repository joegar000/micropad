import clsx from "clsx";
import { BaseWidget, useWidgetInstanceId, useWidgetMenuActions, useWidgetRequestStatus } from "./WidgetBase";
import { useEffect, useMemo, useState } from "react";
import { ButtonViewModel, type IButtonIconModel, type IButtonModel } from "micropad-widgets";
import { useSocket } from "../../../socket";
import { CircularProgress } from "@mui/material";
import { useLayoutStore } from "../../../store/layout-store";

type AppLauncherOption = {
  id: string;
  title: string;
  target: string;
};

function isAppLauncher(spec: IButtonModel) {
  return spec.type === "appLauncher.launcher";
}

function ButtonIcon(props: { icon: IButtonIconModel }) {
  if (props.icon.type === "emoji") {
    return (
      <span
        aria-hidden={props.icon.label ? undefined : true}
        aria-label={props.icon.label}
        className="text-3xl leading-none"
      >
        {props.icon.value}
      </span>
    );
  }

  return (
    <img
      src={props.icon.src}
      alt={props.icon.alt ?? ""}
      className="h-8 w-8 object-contain"
      draggable={false}
    />
  );
}

export default function ButtonWidget(props: IButtonModel) {
  return (
    <BaseWidget>
      <ButtonWidgetContent {...props} />
    </BaseWidget>
  );
}

function ButtonWidgetContent(props: IButtonModel) {
  const [toggled, setToggled] = useState(false);
  const buttonViewModel = useMemo(() => new ButtonViewModel(props), [props]);
  const socket = useSocket();
  const widgetInstanceId = useWidgetInstanceId();
  const eventContext = widgetInstanceId ? { widgetInstanceId } : {};
  const { pending, beginRequest, completeRequest } = useWidgetRequestStatus();
  const { openMenuItem } = useWidgetMenuActions();
  const page = useLayoutStore(s => s.currentPage);
  const widget = page.widgets.find(candidate => candidate.id === widgetInstanceId);
  const selectedApp = widget?.config?.app as AppLauncherOption | undefined;
  const displayText = isAppLauncher(props) ? selectedApp?.title ?? props.text : props.text;

  useEffect(() => {
    return buttonViewModel.onActiveChange(socket, (data) => {
      if (data.isActive !== undefined) {
        setToggled(data.isActive);
        completeRequest();
      }
    });
  }, [buttonViewModel, completeRequest, socket]);

  useEffect(() => {
    return buttonViewModel.onConfirm(socket, () => {
      completeRequest();
    });
  }, [buttonViewModel, completeRequest, socket]);

  return (
    <div className="px-4 py-2 flex h-full w-full">
      <button
        onClick={async () => {
          if (isAppLauncher(props) && !selectedApp) {
            openMenuItem("set-app");
            return;
          }

          buttonViewModel.emitClick(socket, {
            active: !toggled,
            ...(selectedApp ? { app: selectedApp } : {})
          }, eventContext);
          beginRequest();
          if (props.canToggle) {
            setToggled(t => !t);
          }
        }}
        className={clsx(
          "flex-grow-1",
          "rounded-lg",
          "border",
          "border-neutral-700",
          "shadow-md",
          "text-sm",
          "font-medium",
          "flex",
          "items-center",
          "justify-center",
          "gap-2",
          "px-3",
          toggled ? "bg-blue-600 text-white" : "bg-neutral-800/80 text-neutral-100 hover:bg-neutral-700/80"
        )}
      >
        {props.icon && <ButtonIcon icon={props.icon} />}
        <span className="truncate">{displayText}</span>
        {pending && <CircularProgress size={14} thickness={5} />}
      </button>
    </div>
  );
}
