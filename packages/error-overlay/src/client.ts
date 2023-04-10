import iframeScript from 'iframeScript';

import * as errorTypeHandler from './view/errorTypeHandler';
import {
  TYPE_UNHANDLED_ERROR,
  TYPE_UNHANDLED_REJECTION,
  TYPE_BUILD_ERROR,
  TYPE_BUILD_OK,
  TYPE_REFRESH,
  STACK_TRACE_LIMIT
} from './constants';
import { parseStack } from './view/helpers/parseStack';

let isRegistered = false;
let stackTraceLimit: number | undefined = undefined;

let iframe: null | HTMLIFrameElement = null;
let isLoadingIframe: boolean = false;
let isIframeReady: boolean = false;
let errorTypeList: errorTypeHandler.ErrorTypeEvent[] = [];
let hasBuildError: Boolean = false;
let hasRuntimeError: Boolean = false;
let prevRendered = false;

declare global {
  interface Window {
    __SHUVI_ERROR_OVERLAY_GLOBAL_HOOK__: string | {};
  }
}

const iframeStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  border: 'none',
  'z-index': 2147483647
};

function onUnhandledError(ev: ErrorEvent) {
  const error = ev?.error;
  if (!error || !(error instanceof Error) || typeof error.stack !== 'string') {
    // A non-error was thrown, we don't have anything to show.
    return;
  }

  hasRuntimeError = true;
  errorTypeList.push({
    type: TYPE_UNHANDLED_ERROR,
    reason: error,
    frames: parseStack(error.stack)
  });
  update();
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

  hasRuntimeError = true;
  errorTypeList.push({
    type: TYPE_UNHANDLED_REJECTION,
    reason: reason,
    frames: parseStack(reason.stack)
  });
  update();
}

function startReportingRuntimeErrors({ onError }: { onError: () => void }) {
  if (isRegistered) {
    return;
  }
  isRegistered = true;

  try {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = STACK_TRACE_LIMIT;
    stackTraceLimit = limit;
  } catch {}

  window.addEventListener('error', ev => {
    onError();
    onUnhandledError(ev);
  });
  window.addEventListener('unhandledrejection', ev => {
    onError();
    onUnhandledRejection(ev);
  });
}

function stopReportingRuntimeErrors() {
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
  hasRuntimeError = false;
  window.removeEventListener('error', onUnhandledError);
  window.removeEventListener('unhandledrejection', onUnhandledRejection);
}

function onBuildOk() {
  hasBuildError = false;
  errorTypeList.push({ type: TYPE_BUILD_OK });
  if (prevRendered) {
    update();
  }
}

function onBuildError(message: string) {
  hasBuildError = true;
  errorTypeList.push({ type: TYPE_BUILD_ERROR, message });
  update();
}

function onRefresh() {
  errorTypeList.push({ type: TYPE_REFRESH });
}

function applyStyles(element: HTMLElement, styles: Object) {
  element.setAttribute('style', '');
  for (const key in styles) {
    if (!Object.prototype.hasOwnProperty.call(styles, key)) {
      continue;
    }
    //@ts-ignore
    element.style[key] = styles[key];
  }
}

function update() {
  // Loading iframe can be either sync or async depending on the browser.
  if (isLoadingIframe) {
    // Iframe is loading.
    // First render will happen soon--don't need to do anything.
    return;
  }
  if (isIframeReady) {
    // Iframe is ready.
    // Just update it.
    updateIframeContent();
    return;
  }
  // We need to schedule the first render.
  isLoadingIframe = true;
  const loadingIframe = window.document.createElement('iframe');
  applyStyles(loadingIframe, iframeStyle);
  loadingIframe.onload = function () {
    const iframeDocument = loadingIframe.contentDocument;
    if (iframeDocument != null && iframeDocument.body != null) {
      iframe = loadingIframe;
      const script =
        loadingIframe.contentWindow!.document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = iframeScript;
      iframeDocument.body.appendChild(script);
    }
  };
  const appDocument = window.document;
  appDocument.body.appendChild(loadingIframe);
}

function updateIframeContent() {
  if (!iframe) {
    throw new Error('Iframe has not been created yet.');
  }

  //@ts-ignore
  const isRendered = iframe.contentWindow!.updateContent({
    errorTypeList,
    hasBuildError,
    hasRuntimeError
  });

  //After the errors have been added to the queue of the error handler, we must clear the errorTypeList
  errorTypeList = [];

  // Continuous errors and no errors will not operate dom
  if (!isRendered) {
    window.document.body.removeChild(iframe);
    iframe = null;
    isIframeReady = false;
  }
  prevRendered = isRendered;
}

window.__SHUVI_ERROR_OVERLAY_GLOBAL_HOOK__ =
  window.__SHUVI_ERROR_OVERLAY_GLOBAL_HOOK__ || {};

//@ts-ignore
window.__SHUVI_ERROR_OVERLAY_GLOBAL_HOOK__.iframeReady =
  function iframeReady() {
    isIframeReady = true;
    isLoadingIframe = false;
    updateIframeContent();
  };

export { getErrorByType } from './view/helpers/getErrorByType';
export { getServerError } from './view/helpers/nodeStackFrames';
export {
  onBuildError,
  onBuildOk,
  onRefresh,
  startReportingRuntimeErrors,
  stopReportingRuntimeErrors
};
