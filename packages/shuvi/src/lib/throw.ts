import { Runtime } from '@shuvi/types';

/**
 * Only expose error stack to end user on the browser in development mode.
 */
export function throwServerRenderError(
  next: Runtime.IServerAppNext,
  error: any
): void {
  // Note: client
  const errorMsg =
    process.env.NODE_ENV === 'production'
      ? 'Server Render Error' // Note: should not expose error stack in prod
      : `Server Render Error\n\n${error.stack}`;

  // Note: server
  next(new Error(errorMsg));
}
