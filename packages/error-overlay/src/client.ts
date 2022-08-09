import { parse } from 'stacktrace-parser';
import * as errorTypeHandler from './view/errorTypeHandler';
import {
  TYPE_UNHANDLED_ERROR,
  TYPE_UNHANDLED_REJECTION,
  TYPE_BUILD_ERROR,
  TYPE_BUILD_OK,
  TYPE_REFRESH,
  STACK_TRACE_LIMIT
} from './constants';

let isRegistered = false;
let stackTraceLimit: number | undefined = undefined;

function onUnhandledError(ev: ErrorEvent) {
  const error = ev?.error;
  if (!error || !(error instanceof Error) || typeof error.stack !== 'string') {
    // A non-error was thrown, we don't have anything to show.
    return;
  }

  errorTypeHandler.emit({
    type: TYPE_UNHANDLED_ERROR,
    reason: error,
    frames: parse(error.stack!)
  });
}

function onUnhandledRejection(ev: PromiseRejectionEvent) {
  const reason = ev?.reason;
  if (
    !reason ||
    !(reason instanceof Error) ||
    typeof reason.stack !== 'string'
  ) {
    // A non-error was thrown, we don't have anything to show.
    return;
  }

  errorTypeHandler.emit({
    type: TYPE_UNHANDLED_REJECTION,
    reason: reason,
    frames: parse(reason.stack!)
  });
}

function register() {
  if (isRegistered) {
    return;
  }
  isRegistered = true;

  try {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = STACK_TRACE_LIMIT;
    stackTraceLimit = limit;
  } catch {}

  window.addEventListener('error', onUnhandledError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
}

function unregister() {
  if (!isRegistered) {
    return;
  }
  isRegistered = false;

  if (stackTraceLimit !== undefined) {
    try {
      Error.stackTraceLimit = stackTraceLimit;
    } catch {}
    stackTraceLimit = undefined;
  }

  window.removeEventListener('error', onUnhandledError);
  window.removeEventListener('unhandledrejection', onUnhandledRejection);
}

function onBuildOk() {
  errorTypeHandler.emit({ type: TYPE_BUILD_OK });
}

function onBuildError(message: string) {
  errorTypeHandler.emit({ type: TYPE_BUILD_ERROR, message });
}

function onRefresh() {
  errorTypeHandler.emit({ type: TYPE_REFRESH });
}

export { getErrorByType } from './view/helpers/getErrorByType';
export { getServerError } from './view/helpers/nodeStackFrames';
export { onBuildError, onBuildOk, onRefresh, register, unregister };
