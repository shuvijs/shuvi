export interface Defer<T = void> {
  resolve(T?: T | PromiseLike<T>): void;
  reject(err: any): void;
  promise: Promise<T>;
}

export function createDefer<T>(): Defer<T> {
  let defer = {
    resolve: null,
    reject: null
  } as any as Defer<T>;

  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });

  return defer;
}
