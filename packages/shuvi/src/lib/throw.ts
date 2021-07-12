import { Runtime } from '@shuvi/types';
import { asyncCall } from './utils';

/**
 * Only expose error stack to end user on the browser in development mode.
 */

export function throwServerRenderError(
  req: Runtime.IIncomingMessage,
  res: Runtime.IServerAppResponse,
  error: any
): void {
  asyncCall(function () {
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
