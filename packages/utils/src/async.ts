export type Results<T = any> = T[] & {
  first: T;
  _firstFlag: boolean;
};

export type SimpleCallback = () => any;

export interface AsyncParallelIteratorCallback<T = unknown, E = unknown> {
  (err?: E | null, value?: T): void;
}

export interface AsyncParallelIterator<T, E> {
  (item: T, callback: AsyncParallelIteratorCallback<T, E>): void;
}

export interface AsyncIterator<T, E> {
  (item: T, callback: ErrorCallback<E>): void;
}

export interface ErrorCallback<T> {
  (err?: T | null): void;
}

export type AsyncParallelCallback<T, E> = (
  finishedNum: number,
  values: Results<T>,
  errors: Results<E>,
  done: SimpleCallback
) => any;

function runParallel<T = unknown, E = unknown>(
  targets: T[],
  handler: AsyncParallelIterator<T, E>,
  cb: AsyncParallelCallback<T, E>
) {
  const values = [] as any as Results;
  const errors = [] as any as Results;
  let finishedNum = 0;
  let abort = false;

  const done = () => {
    abort = true;
  };

  if (targets.length <= 0) {
    return cb(finishedNum, values, errors, done);
  }

  const handlerCallback = (index: number) => {
    let called = false;
    return (err?: E | null, value?: any) => {
      if (called) {
        return;
      }
      called = true;

      if (abort) {
        return;
      }

      finishedNum++;

      if (err) {
        if (!errors.first) {
          errors.first = err;
        }
        errors[index] = err;
        return cb(finishedNum, values, errors, done);
      }

      if (!values._firstFlag) {
        values._firstFlag = true;
        values[index] = value;
      }
      cb(finishedNum, values, errors, done);
    };
  };

  targets.forEach((t, index) => {
    handler(t, handlerCallback(index));
  });
}

export function each<T = unknown, E = unknown>(
  targets: T[],
  handler: AsyncIterator<T, E>,
  cb?: ErrorCallback<E>
) {
  runParallel(targets, handler, (finishedNum, values, errors, done) => {
    if (errors.first) {
      done();
      return cb && cb(errors.first);
    }

    if (finishedNum === targets.length) {
      done();
      cb && cb(null);
    }
  });
}
