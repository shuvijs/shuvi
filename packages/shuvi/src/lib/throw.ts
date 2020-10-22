/**
 * Only expose error stack to end user in development mode.
 * @param error 
 */
export function throwServerRenderError(error: any): void {
  error.status = error.status || 500;
  error.expose = true;
  error.message =
    process.env.NODE_ENV === 'production'
      ? 'Server Render Error'
      : `Server Render Error\n\n${error.stack}`;
  throw error;
}
