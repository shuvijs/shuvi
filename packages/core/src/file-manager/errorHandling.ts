export function callWithErrorHandling(fn: Function, args?: unknown[]) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    console.error(err);
  }
  return res;
}
