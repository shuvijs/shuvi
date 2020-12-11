import { Runtime } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';

export interface Options {
  rootDir: string;
}

export interface InternalServerMiddlewareOptions
  extends Runtime.IServerMiddlewareOptions {
  handler: Runtime.IServerMiddlewareHandler;
  path: string;
  order: number;
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
): InternalServerMiddlewareOptions {
  let middlewareOptions: Runtime.IServerMiddlewareOptions;
  if (typeof middleware !== 'object') {
    middlewareOptions = {
      handler: middleware
    };
  } else {
    middlewareOptions = middleware;
  }

  let handler: Runtime.IServerMiddlewareHandler;
  if (typeof middlewareOptions.handler === 'string') {
    const resolvedPath = resolveHandler(middlewareOptions.handler, options);
    handler = require(resolvedPath);
  } else if (typeof middlewareOptions.handler === 'function') {
    handler = middlewareOptions.handler;
  } else {
    throw new Error(
      `Middleware must be one of type [string, function, object]`
    );
  }

  return {
    handler,
    // Note: default to match all routes
    path: middlewareOptions.path ?? '*',
    order: middlewareOptions.order ?? 0
  };
}
