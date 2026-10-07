export function singleflight<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>): (...args: TArgs) => Promise<TResult> {
  let inFlight: Promise<TResult> | undefined;

  return (...args) => {
    if (inFlight) return inFlight;

    const promise = fn(...args);
    inFlight = promise;

    promise.then(
      () => {
        if (inFlight === promise) inFlight = undefined;
      },
      () => {
        if (inFlight === promise) inFlight = undefined;
      }
    );

    return promise;
  };
}
