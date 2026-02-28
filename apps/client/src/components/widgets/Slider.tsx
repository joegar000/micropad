import { useWidgetId, widget, type WidgetProps } from "../gridstack/Widget";
import { useEffect, useState } from "react";
import { useGridstackContext } from "../gridstack";
import clsx from "clsx";

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
    const { onReady } = useGridstackContext();
    const widgetId = useWidgetId();
    const [rotation, setRotation] = useState<'horizontal' | 'vertical'>('vertical');

    useEffect(() => {
      const unsub = onReady(grid => {
        grid.on('resizestop', (_event, item) => {
          if (item.getAttribute('gs-id') !== widgetId) return;
          const w = Number(item.getAttribute('gs-w') ?? '1');
          const h = Number(item.getAttribute('gs-h') ?? '1');
          setRotation(w > h ? 'horizontal' : 'vertical');
        });
      });
      return () => unsub();
    }, [value]);

    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="h-full w-full flex justify-center">
          <input
            style={{ writingMode: rotation === 'vertical' ? 'sideways-lr' : undefined, }}
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
        <div className="text-sm text-neutral-400">{value}%</div>
      </div>
    );
  }, spec.type);

  const Final = (props: Omit<WidgetProps, 'children' | 'title'>) => (
    <Slider {...props} title={spec.title} />
  );
  return Final;
}