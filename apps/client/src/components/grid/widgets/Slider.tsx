import { useCallback, useRef, useState } from "react";
import { BaseWidget } from "./WidgetBase";
import { type ISliderSpec } from "micropad-widgets";
import { useWidgetEventEmitter, useWidgetUpdateListener } from "../../../socket";
import { debounce } from "es-toolkit";
import { Slider } from "@mui/material";
import RotateRightIcon from '@mui/icons-material/RotateRight';

export default function SliderWiget(props: ISliderSpec) {
  const [value, setValue] = useState<number>(50);
  const [rotation, setRotation] = useState<'horizontal' | 'vertical'>('vertical');
  const divRef = useRef<HTMLDivElement>(null);
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
    <BaseWidget
      extraOptions={[
        {
          icon: <RotateRightIcon />,
          onClick: () => setRotation(r => r === 'horizontal' ? 'vertical' : 'horizontal')
        }
      ]}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <div ref={divRef} className="flex-grow-1 pt-10 flex justify-center w-[90%]">
          <Slider
            orientation={rotation}
            min={props.min ?? 0}
            max={props.max ?? 100}
            step={props.step ?? 1}
            value={value}
            onChange={(_e, newValue) => {
              setValue(newValue);
              debounceChange(newValue);
            }}
          />
        </div>
        <div className="text-sm text-neutral-400 py-2">{value}%</div>
      </div>
    </BaseWidget>
  );
}
