import { useEffect, useMemo, useRef, useState } from "react";
import { BaseWidget, useWidgetInstanceId, useWidgetRequestStatus } from "./WidgetBase";
import { type ISliderModel, SliderViewModel } from "micropad-widgets";
import { debounce } from "es-toolkit";
import { Slider } from "@mui/material";
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { useSocket } from "../../../socket";

export default function SliderWiget(props: ISliderModel) {
  const [rotation, setRotation] = useState<'horizontal' | 'vertical'>('vertical');

  return (
    <BaseWidget
      extraOptions={[
        {
          icon: <RotateRightIcon />,
          onClick: () => setRotation(r => r === 'horizontal' ? 'vertical' : 'horizontal')
        }
      ]}
    >
      <SliderWidgetContent {...props} rotation={rotation} />
    </BaseWidget>
  );
}

function SliderWidgetContent(props: ISliderModel & { rotation: 'horizontal' | 'vertical' }) {
  const [value, setValue] = useState<number>(50);
  const divRef = useRef<HTMLDivElement>(null);
  const sliderViewModel = useMemo(() => new SliderViewModel(props), [props]);
  const socket = useSocket();
  const widgetInstanceId = useWidgetInstanceId();
  const eventContext = useMemo(() => widgetInstanceId ? { widgetInstanceId } : {}, [widgetInstanceId]);
  const { beginRequest, completeRequest } = useWidgetRequestStatus();

  useEffect(() => {
    return sliderViewModel.onChange(socket, (data) => {
      if (data.value !== undefined) {
        setValue(data.value);
        completeRequest();
      }
    });
  }, [completeRequest, sliderViewModel, socket]);

  const debounceChange = useMemo(() => {
    return debounce((value: number) => {
      sliderViewModel.emitChange(socket, { value }, eventContext);
      beginRequest();
    }, 200);
  }, [beginRequest, sliderViewModel, socket, eventContext]);

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center">
        <div ref={divRef} className="flex-grow-1 pt-10 flex justify-center w-[90%]">
          <Slider
            orientation={props.rotation}
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
    </>
  );
}
