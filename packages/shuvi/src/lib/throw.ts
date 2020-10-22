import { Runtime } from '@shuvi/types';

/**
 * Only expose error stack to end user on the browser in development mode.
 */
export function throwServerRenderError(
  ctx: Runtime.IKoaContext,
  error: any
): void {
  // Note: client
  ctx.status = error.status || 500;
  ctx.body =
    process.env.NODE_ENV === 'production'
      ? 'Server Render Error' // Note: should not expose error stack in prod
      : `Server Render Error\n\n${error.stack}`;

  // Note: server
  ctx.app.emit('error', error, ctx);
}
