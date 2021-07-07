import { Runtime } from '@shuvi/types';
/**
 * Only expose error stack to end user on the browser in development mode.
 */
export function throwServerRenderError(
  req: Runtime.IIncomingMessage,
  res: Runtime.IServerAppResponse,
  next: Runtime.IServerAppNext,
  error: any
): void {
  // Note: client
  res.statusCode = error.statusCode || 500;
  const errorMsg =
    process.env.NODE_ENV === 'production'
      ? 'Server Render Error' // Note: should not expose error stack in prod
      : `Server Render Error\n\n${error.stack}`;
  res.end(errorMsg);

  // Note: server
  next(error);
}
