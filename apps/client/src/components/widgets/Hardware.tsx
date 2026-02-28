import { widget } from "../gridstack/Widget";

export const HardwareWidget = widget(() => {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex justify-between">
        <span>CPU Temp</span>
        <span>68°C</span>
      </div>
      <div className="flex justify-between">
        <span>CPU Load</span>
        <span>60%</span>
      </div>
      <div className="flex justify-between">
        <span>GPU Temp</span>
        <span>68°C</span>
      </div>
    </div>
  );
}, 'hardware');