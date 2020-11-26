import launchEditor from 'launch-editor';
import { Runtime } from '@shuvi/types';

export function createLaunchEditorMiddleware(
  launchEditorEndpoint: string
): Runtime.IServerAppMiddleware {
  return async function launchEditorMiddleware(ctx, next) {
    if (ctx.request.url.startsWith(launchEditorEndpoint)) {
      const { query } = (ctx.req as Runtime.IIncomingMessage).parsedUrl;
      const lineNumber = parseInt(query.lineNumber as string, 10) || 1;
      const colNumber = parseInt(query.colNumber as string, 10) || 1;
      launchEditor(`${query.fileName}:${lineNumber}:${colNumber}`);
      ctx.body = '';
      return;
    } else {
      await next();
    }
  };
}
