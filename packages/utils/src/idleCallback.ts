/**
 * Force execution of callback after the specified timeout, default 3000ms
 */
function _requestIdleCallbackPolyfill(
  cb: IdleRequestCallback,
  options: IdleRequestOptions = { timeout: 3000 }
) {
  return setTimeout(() => {
    cb({ didTimeout: false, timeRemaining: () => 50 });
  }, options.timeout);
}

/**
 * For server side, invoke the callback immediately
 */
function _requestIdleCallbackServerSide(cb: IdleRequestCallback) {
  cb({ didTimeout: false, timeRemaining: () => 50 });
  return NaN;
}

/**
 * Assume the polyfill is implemented by setTimeout
 */
function _cancelIdleCallbackPolyfill(id: number) {
  clearTimeout(id);
}

/**
 * Do nothing on server side
 */
function _cancelIdleCallbackServerSide(_id: number) {
  return;
}

export const requestIdleCallback =
  typeof window !== 'undefined'
    ? window.requestIdleCallback || _requestIdleCallbackPolyfill
    : _requestIdleCallbackServerSide;

export const cancelIdleCallback =
  typeof window !== 'undefined'
    ? window.cancelIdleCallback || _cancelIdleCallbackPolyfill
    : _cancelIdleCallbackServerSide;

/**
 * awaitPageLoadAndIdle - Invokes the callback after:
 *  1. The page has finished loading
 *  2. Idle time remaining is >= specified `remainingTime` (default 49ms)
 *  3. Timeout of `timeout` duration (default 2000ms) if idle condition is not met
 */
export function awaitPageLoadAndIdle(
  { remainingTime, timeout }: { remainingTime: number; timeout: number } = {
    remainingTime: 49,
    timeout: 2000
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Return early if function is called in a non-browser environment
    if (typeof window === 'undefined') {
      return reject(
        new Error('[awaitPageLoadAndIdle] server side is not supported')
      );
    }

    let idleCallbackId: number | undefined; // Tracks the idle callback

    const tid = setTimeout(() => {
      if (cancelIdleCallback && idleCallbackId) {
        cancelIdleCallback(idleCallbackId);
      }
      resolve(); // Force resolve after timeout
    }, timeout);

    // Function to check if sufficient idle time is available
    function onIdle(deadline: IdleDeadline) {
      if (deadline.timeRemaining() >= remainingTime) {
        clearTimeout(tid);
        resolve();
      } else {
        idleCallbackId = requestIdleCallback(onIdle); // Retry if idle time insufficient
      }
    }

    // Event handler to trigger on page load
    const onLoad = () => {
      window.removeEventListener('load', onLoad); // Clean up listener
      idleCallbackId = requestIdleCallback(onIdle); // Start checking for idle time
    };

    // If page is already loaded, check idle time immediately
    if (document.readyState === 'complete') {
      idleCallbackId = requestIdleCallback(onIdle);
    } else {
      window.addEventListener('load', onLoad); // Wait for page load event
    }
  });
}
