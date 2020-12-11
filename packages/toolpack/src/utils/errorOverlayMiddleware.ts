import launchEditor from 'launch-editor';
import { Runtime } from '@shuvi/types';

function getSourcePath(source: string) {
  // Webpack prefixes certain source paths with this path
  if (source.startsWith('webpack:///')) {
    return source.substring(11);
  }

  // Make sure library name is filtered out as well
  if (source.startsWith('webpack://_N_E/')) {
    return source.substring(15);
  }

  if (source.startsWith('webpack://')) {
    return source.substring(10);
  }

  if (source.startsWith('/')) {
    return source.substring(1);
  }

  return source;
}

export function createLaunchEditorMiddleware(
  launchEditorEndpoint: string
): Runtime.IServerMiddlewareHandler {
  return async function launchEditorMiddleware(ctx, next) {
    if (ctx.request.url.startsWith(launchEditorEndpoint)) {
      const { query } = (ctx.req as Runtime.IIncomingMessage).parsedUrl;
      const lineNumber = parseInt(query.lineNumber as string, 10) || 1;
      const colNumber = parseInt(query.colNumber as string, 10) || 1;
      launchEditor(
        getSourcePath(`${query.fileName}:${lineNumber}:${colNumber}`)
      );
      ctx.body = '';
      return;
    } else {
      await next();
    }
  };
}
