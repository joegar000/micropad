export type MediaState<Signal> = {
  runtimeState: {
    volume?: number;
    muted?: boolean;
    playing?: boolean;
  },
  signal: Signal;
};
