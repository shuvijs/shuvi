export function once<T extends Function>(fn: T): T {
  let hasRun = false;
  let result: unknown;

  function wrapped(this: unknown, ...args: unknown[]) {
    if (!hasRun) {
      hasRun = true;
      result = fn.apply(this, args);
    }

    return result;
  }

  return (wrapped as any) as T;
}
