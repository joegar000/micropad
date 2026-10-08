export function singleflight<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>): (...args: TArgs) => Promise<TResult> {
  let inFlight: Promise<TResult> | undefined;

  return (...args) => {
    if (inFlight) return inFlight;

    inFlight = fn(...args);

    inFlight.then(
      () => {
        inFlight = undefined;
      },
      () => {
        inFlight = undefined;
      }
    );

    return inFlight;
  };
}
