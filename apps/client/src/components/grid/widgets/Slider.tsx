import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { BaseWidget } from "./WidgetBase";
import { type ISliderSpec } from "micropad-widgets";
import { useWidgetEventEmitter, useWidgetUpdateListener } from "../../../socket";
import { debounce } from "es-toolkit";

export default function SliderWiget(props: ISliderSpec) {
  const [value, setValue] = useState<number>(50);
  // const [rotation, setRotation] = useState<'horizontal' | 'vertical'>('vertical');
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emitWidgetEvent = useWidgetEventEmitter(props.type);

  useWidgetUpdateListener(props.type, (data) => {
    if (data.value !== undefined) {
      setValue(data.value);
    }
  });

  const debounceChange = useCallback(
    debounce((value: number) => emitWidgetEvent('change', { value }), 200),
    [emitWidgetEvent]
  );

  return (
    <BaseWidget>
      <div className="h-full flex flex-col items-center justify-center">
        <div ref={divRef} className="flex-grow-1 pt-10 flex justify-center overflow-hidden">
          <input
            ref={inputRef}
            aria-label="Volume"
            type="range"
            min={props.min ?? 0}
            max={props.max ?? 100}
            step={props.step ?? 1}
            value={value}
            onChange={(e) => {
              setValue(e.target.valueAsNumber);
              debounceChange(e.target.valueAsNumber);
            }}
            className={clsx("accent-neutral-400", 'w-full')}
          />
        </div>
        <div className="text-sm text-neutral-400 py-2">{value}%</div>
      </div>
    </BaseWidget>
  );
}
