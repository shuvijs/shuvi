export interface Defer<T = void> {
  resolve(T?: T | PromiseLike<T>): void;
  reject(err: any): void;
  promise: Promise<T>;
  status: 'pending' | 'fulfilled' | 'rejected';
}

export function createDefer<T>(): Defer<T> {
  let defer = {
    resolve: null,
    reject: null,
    status: 'pending'
  } as any as Defer<T>;

  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = (value: T) => {
      resolve(value);
      defer.status = 'fulfilled';
    };
    defer.reject = (value: T) => {
      reject(value);
      defer.status = 'rejected';
    };
  });

  return defer;
}
