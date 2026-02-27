import clsx from "clsx";
import { widget, type WidgetProps } from "../layout/Widget";
import { createContext, useEffect, useRef, useState } from "react";
import { MdVolumeOff, MdVolumeDown, MdVolumeUp } from "react-icons/md";

interface SliderSpec {
  onChange: (value: number) => void;
  title: string;
  type: string;
  step?: number;
  min?: number;
  max?: number;
}

export function slider(spec: SliderSpec) {
  const Slider = widget(() => {
    const [value, setValue] = useState<number>(50);
    const [rotation, setRotation] = useState<'vertical' | 'horizontal'>('horizontal');
    const ref = useRef<ResizeObserver>(null);

    useEffect(() => {
      spec.onChange(value);
    }, [value]);

    return (
      <div
        className="h-full flex"
        ref={node => {
          if (!node) {
            ref.current?.disconnect();
            return;
          };
          ref.current = new ResizeObserver(entries => {
            for (let entry of entries) {
              const { width, height } = entry.contentRect;
              setRotation(width < height ? 'vertical' : 'horizontal');
            }
          });
          ref.current.observe(node);
          if (node.getBoundingClientRect().width < node.getBoundingClientRect().height) {
            setRotation('vertical');
          }
        }}
      >
        <div className="flex-grow-1 flex flex-col items-center justify-center gap-4">
          <div className="flex-grow-1 w-full">
            <input
              aria-label="Volume"
              type="range"
              min={spec.min ?? 0}
              max={spec.max ?? 100}
              step={spec.step ?? 1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={clsx("accent-neutral-400 h-full w-full", rotation === 'vertical' ? "rotate-270" : "")}
            />
          </div>
          <div className="text-sm text-neutral-400">{value}%</div>
        </div>
      </div>
    );
  }, spec.type);

  const Final = (props: Omit<WidgetProps, 'children' | 'title'>) => (
    <Slider {...props} title={spec.title} />
  );
  return Final;
}