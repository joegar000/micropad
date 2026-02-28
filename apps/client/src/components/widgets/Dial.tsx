import { useEffect, useRef, useState } from "react";
import CircularSlider from "react-circular-slider-svg";
import { useGridstackContext, useWidgetId, widget } from "../gridstack";
import useResizeObserver from "../../hooks/resizeobserver";

interface DialSpec {
  onChange: (value: number) => void;
  title: string;
  type: string;
  step?: number;
  min?: number;
  max?: number;
}

export function dial(spec: DialSpec) {
  return widget(() => {
    const [value, setValue] = useState(50);
    const [size, setSize] = useState<number>(200);
    const ref = useRef<HTMLDivElement>(null);
    const percentRef = useRef<HTMLDivElement>(null);
    const { onReady } = useGridstackContext();
    const widgetId = useWidgetId();
    useResizeObserver(ref, (entry) => {
      const { width, height } = entry.contentRect;
      const newSize = Math.min(width, height);
      setSize(newSize);
    });

    return (
      <div className="h-full relative pt-[5%]">
        <div className="absolute h-full w-full h-full flex items-center justify-center pointer-events-none"
          style={{ height: size }}
        >
          <div className="text-sm text-neutral-400 position-absolute">{value}%</div>
        </div>
        <div ref={ref} className="not-draggable flex justify-center w-full h-full overflow-hidden">
          <CircularSlider
            size={size}
            trackWidth={4}
            minValue={spec.min ?? 0}
            maxValue={spec.max ?? 100}
            startAngle={40}
            endAngle={320}
            coerceToInt={true}
            angleType={{
              direction: "cw",
              axis: "-y"
            }}
            handle1={{
              value,
              onChange: v => {
                setValue(v);
                spec.onChange(v);
              }
            }}
            arcColor="#959595"
            arcBackgroundColor="rgb(93, 93, 93)"
          />
        </div>
      </div>
      
    );
  }, spec.type, spec.title);
}

dial({
  onChange: (value) => {
    console.log("Dial value:", value);
  },
  title: "Dial",
  type: "dial"
});