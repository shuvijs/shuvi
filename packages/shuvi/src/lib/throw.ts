import { Runtime } from '@shuvi/types';
/**
 * Only expose error stack to end user on the browser in development mode.
 */

const defer =
  typeof setImmediate === 'function'
    ? setImmediate
    : function (fn: any) {
        process.nextTick(fn.bind.apply(fn, arguments));
      };

export function throwServerRenderError(
  req: Runtime.IIncomingMessage,
  res: Runtime.IServerAppResponse,
  error: any
): void {
  defer(function () {
    console.error(`server error: ${req.url} `, error.stack || error.toString());
  });
  // Note: client
  res.statusCode = error.statusCode || 500;
  const errorMsg =
    process.env.NODE_ENV === 'production'
      ? 'Server Render Error' // Note: should not expose error stack in prod
      : `Server Render Error\n\n${error.stack}`;
  res.end(errorMsg);
}
