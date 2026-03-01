import clsx from "clsx";
import { widget, type WidgetSpec } from "..";
import { useEffect, useState } from "react";

export interface ButtonSpec extends WidgetSpec {
  onClick: () => void;
  isToggled?: boolean | (() => Promise<boolean>);
  text?: string;
}

export function button(spec: ButtonSpec) {
  return widget(() => {
    const getToggled = async () => {
      if (typeof spec.isToggled === 'function') {
        return await spec.isToggled();
      } else {
        return spec.isToggled ?? false;
      }
    }
    
    useEffect(() => {
      getToggled().then(setToggled);
    }, []);

    const [toggled, setToggled] = useState(false);
    return (
      <button
        onClick={async () => {
          spec.onClick();
          const isToggled = await getToggled();
          setToggled(isToggled);
        }}
        className={clsx(
          "w-full",
          "h-full",
          "px-4",
          "py-2",
          "rounded-lg",
          "border",
          "border-neutral-700",
          "shadow-md",
          "text-sm",
          "font-medium",
          toggled ? "bg-blue-600 text-white" : "bg-neutral-800/80 text-neutral-100 hover:bg-neutral-700/80"
        )}
      >
        {spec.text ?? spec.title}
      </button>
    );
  }, spec);
}

let _toggleState = false;
button({
  text: 'Button',
  type: 'button',
  onClick: () => {
    console.log("Button clicked");
  },
  isToggled() {
    _toggleState = !_toggleState;
    return Promise.resolve(_toggleState);
  },
});