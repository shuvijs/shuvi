import { StackFrame } from 'stacktrace-parser';
import {
  TYPE_BUILD_ERROR,
  TYPE_UNHANDLED_ERROR,
  TYPE_UNHANDLED_REJECTION
} from './constants';

export type BuildError = {
  type: typeof TYPE_BUILD_ERROR;
  message: string;
};

export type UnhandledError = {
  type: typeof TYPE_UNHANDLED_ERROR;
  reason: Error;
  frames: StackFrame[];
};
export type UnhandledRejection = {
  type: typeof TYPE_UNHANDLED_REJECTION;
  reason: Error;
  frames: StackFrame[];
};
export type ErrorTypeEvent = BuildError | UnhandledError | UnhandledRejection;

export type ErrorTypeEventHandler = (ev: ErrorTypeEvent) => void;

let handlers: Set<ErrorTypeEventHandler> = new Set();
let queue: ErrorTypeEvent[] = [];

function drain() {
  // Draining should never happen synchronously in case multiple handlers are
  // registered.
  setTimeout(function () {
    while (
      // Until we are out of events:
      Boolean(queue.length) &&
      // Or, if all handlers removed themselves as a result of handling the
      // event(s)
      Boolean(handlers.size)
    ) {
      const ev = queue.shift()!;
      handlers.forEach(handler => handler(ev));
    }
  }, 1);
}

export function emit(ev: ErrorTypeEvent): void {
  queue.push(Object.freeze({ ...ev }));
  drain();
}

export function on(fn: ErrorTypeEventHandler): boolean {
  if (handlers.has(fn)) {
    return false;
  }

  handlers.add(fn);
  drain();
  return true;
}

export function off(fn: ErrorTypeEventHandler): boolean {
  if (handlers.has(fn)) {
    handlers.delete(fn);
    return true;
  }

  return false;
}
