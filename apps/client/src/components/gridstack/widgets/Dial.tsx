import { useRef, useState } from "react";
import CircularSlider from "react-circular-slider-svg";
import useResizeObserver from "../../../hooks/resizeobserver";
import { registerWidget, Widget } from "./Registration";

export interface DialProps {
  endpoint: string;
  step?: number;
  min?: number;
  max?: number;
}

export interface DialRequest {
  value: number;
}

registerWidget('dial', (spec: DialProps) => {
  const [value, setValue] = useState(50);
  const [size, setSize] = useState<number>(200);
  const ref = useRef<HTMLDivElement>(null);

  useResizeObserver(ref, (entry) => {
    const { width, height } = entry.contentRect;
    const newSize = Math.min(width, height);
    setSize(newSize);
  });


  return (
    <Widget type='dial'>
      <div className="h-full relative mt-[5%]">
        <div className="absolute w-full h-full flex items-center justify-center pointer-events-none"
        >
          <div className="w-full flex items-center justify-center"
            style={{ height: size }}
          >
            <div className="text-sm text-neutral-400 position-absolute">{value}%</div>
          </div>
        </div>
        <div ref={ref} className="not-draggable flex justify-center items-center w-full h-full overflow-hidden">
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
              }
            }}
            arcColor="#959595"
            arcBackgroundColor="rgb(93, 93, 93)"
          />
        </div>
      </div>
    </Widget>
  );
});
