import { Runtime } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';

export interface Options {
  rootDir: string;
}

function resolveHandler(handler: string, options: Options) {
  try {
    // Note: check if it is a npm module
    resolve.sync(handler, { basedir: options.rootDir });
    return handler;
  } catch (error) {
    throw new Error(`"${handler}" handler do not exist.`);
  }
}

export function normalizeServerMiddleware(
  middleware: Runtime.IServerMiddleware,
  options: Options
): {
  path: string;
  handler: Runtime.IServerAppMiddleware | Runtime.IServerAppHandler;
} {
  let path: string;
  let handler: Runtime.IServerAppMiddleware | Runtime.IServerAppHandler;

  if (typeof middleware === 'object') {
    return {
      ...normalizeServerMiddleware(middleware.handler, options),
      path: middleware.path
    };
  } else if (typeof middleware === 'string') {
    path = '*'; // Note: match all routes
    const resolvedPath = resolveHandler(middleware, options);

    handler = require(resolvedPath);
  } else if (typeof middleware === 'function') {
    path = '*';
    handler = middleware;
  } else {
    throw new Error(
      `Middleware must be one of type [string, function, object]`
    );
  }

  return { path, handler };
}
