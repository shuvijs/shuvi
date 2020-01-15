export function waitN(num: number, cb: () => void) {
  let count = 0;

  return function callback() {
    if (++count >= num) {
      cb();
    }
  };
}
