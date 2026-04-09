import clsx from "clsx";
import { BaseWidget } from "./WidgetBase";
import { useMemo, useState } from "react";
import { ButtonViewModel, type IButtonModel } from "micropad-widgets";
import { useSocket } from "../../../socket";

export default function ButtonWidget(props: IButtonModel) {
  const [toggled, setToggled] = useState(false);
  const buttonViewModel = useMemo(() => new ButtonViewModel(props), [props]);
  const socket = useSocket();

  buttonViewModel.onActiveChange(socket, (data) => {
    if (data.isActive !== undefined) {
      setToggled(data.isActive);
    }
  });

  return (
    <BaseWidget>
      <div className="px-4 py-2 flex h-full w-full">
        <button
          onClick={async () => {
            buttonViewModel.emitClick(socket, { active: !toggled });
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
