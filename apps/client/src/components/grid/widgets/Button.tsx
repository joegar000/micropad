import clsx from "clsx";
import { BaseWidget } from "./WidgetBase";
import { useState } from "react";
import { type IButtonSpec } from "micropad-widgets";
import { useWidgetEventEmitter, useWidgetUpdateListener } from "../../../socket";

export default function ButtonWidget(props: IButtonSpec) {
  const [toggled, setToggled] = useState(false);
  const emitWidgetEvent = useWidgetEventEmitter(props.type);

  useWidgetUpdateListener(props.type, (data) => {
    if (data.toggled !== undefined) {
      setToggled(data.toggled);
    }
  });

  return (
    <BaseWidget>
      <div className="px-4 py-2 flex h-full w-full">
        <button
          onClick={async () => {
            emitWidgetEvent('click', { toggled: !toggled });
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
            toggled ? "bg-blue-600 text-white" : "bg-neutral-800/80 text-neutral-100 hover:bg-neutral-700/80"
          )}
        >
          {props.text}
        </button>
      </div>
    </BaseWidget>
  );
}
