import { widget } from "../layout/Widget";

export const ClockWidget = widget(() => {
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex h-full items-center justify-center text-5xl font-semibold">
      {time}
    </div>
  );
}, 'clock');