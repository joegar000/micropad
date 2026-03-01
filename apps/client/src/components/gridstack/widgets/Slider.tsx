import { useWidgetId, widget, type WidgetSpec } from "./Registration";
import { useEffect, useRef, useState } from "react";
import { useGridstackContext } from "..";
import clsx from "clsx";
import useResizeObserver from "../../../hooks/resizeobserver";

export interface SliderSpec extends WidgetSpec {
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

export function slider(spec: SliderSpec) {
  return widget(({ w = 1, h = 1 }) => {
    const [value, setValue] = useState<number>(50);
    const { onReady } = useGridstackContext();
    const widgetId = useWidgetId();
    const [rotation, setRotation] = useState<'horizontal' | 'vertical'>(w >= h ? 'horizontal' : 'vertical');
    const divRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useResizeObserver(divRef, (entry) => {
      if (!divRef.current || !inputRef.current || rotation !== 'vertical') {
        inputRef.current?.style.removeProperty('width');
        inputRef.current?.style.removeProperty('min-width');
        inputRef.current?.style.removeProperty('max-width');
        return;
      };
      const { height } = entry.contentRect;
      inputRef.current.style.minWidth = `${height}px`;
      inputRef.current.style.maxWidth = `${height}px`;
      inputRef.current.style.width = `${height}px`;
    });

    useEffect(() => {
      const unsub = onReady(grid => {
        grid.on('resizestop', (_event, item) => {
          if (item.getAttribute('gs-id') !== widgetId) return;
          const w = Number(item.getAttribute('gs-w') ?? '1');
          const h = Number(item.getAttribute('gs-h') ?? '1');
          setRotation(w >= h ? 'horizontal' : 'vertical');
        });
      });
      return () => unsub();
    }, [value]);

    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div ref={divRef} className="w-[90%] flex-grow-1 pt-10 flex justify-center">
          <input
            ref={inputRef}
            style={{ transform: rotation === 'vertical' ? 'rotate(270deg)' : undefined }}
            aria-label="Volume"
            type="range"
            min={spec.min ?? 0}
            max={spec.max ?? 100}
            step={spec.step ?? 1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className={clsx("accent-neutral-400", { 'w-full': rotation === 'horizontal' })}
          />
        </div>
        <div className="text-sm text-neutral-400 py-2">{value}%</div>
      </div>
    );
  }, spec);
}

slider({
  title: 'Volume',
  type: 'volume',
  onChange: (value) => {
    console.log("Volume changed to", value);
  }
});