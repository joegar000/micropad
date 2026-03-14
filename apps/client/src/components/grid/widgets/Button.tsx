import clsx from "clsx";
import { registerWidget, BaseWidget, type WidgetSpec } from "./WidgetBase";
import { useState } from "react";

export interface ButtonSpec extends WidgetSpec<'button'> {
  text: string;
  endpoint: string;
  canToggle?: boolean;
}

export interface ButtonRequest {
  canToggle?: boolean;
  isToggled?: boolean;
}

registerWidget('button', (props: ButtonSpec) => {
  const [toggled, setToggled] = useState(false);
  // TODO: consider `useOptimistic` here
  return (
    <BaseWidget title={props.title} type='button'>
      <div className="px-4 py-2 flex h-full w-full">
        <button
          onClick={async () => {
            const res = await fetch(props.endpoint);
            if (res.ok && props.canToggle) {
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
});
