import { RemoveListenerCallback } from '../types';
const isDev = process.env.NODE_ENV === 'development';

export type Events<F> = {
  toArray: () => F[];
  length: number;
  push: (fn: F) => RemoveListenerCallback;
  call: (...arg: any) => void;
};

export function createEvents<F extends Function>(): Events<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    toArray() {
      return handlers;
    },
    push(fn: F) {
      handlers.push(fn);
      return function () {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(...arg) {
      handlers.forEach(fn => fn && fn(...arg));
    }
  };
}

export const readOnly: <T extends unknown>(obj: T) => T = isDev
  ? obj => Object.freeze(obj)
  : obj => obj;

export function warning(cond: boolean, message: string) {
  if (!cond) {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined') console.warn(message);

    try {
      // Welcome to debugging history!
      //
      // This error is thrown as a convenience so you can more easily
      // find the source for a warning that appears in the console by
      // enabling "pause on exceptions" in your JavaScript debugger.
      throw new Error(message);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}
