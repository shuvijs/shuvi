import { resolveSync } from '@shuvi/utils/lib/resolve';
import { IMiddlewareHandler } from './http-server';

interface Options {
  rootDir: string;
}

interface IMiddlewareOptions {
  handler: string | IMiddlewareHandler;
  path?: string;
}

export type IServerMiddlewareOptions = IMiddlewareOptions | IMiddlewareHandler;

export type IServerMiddleware = string | IServerMiddlewareOptions;

interface InternalServerMiddlewareOptions extends IMiddlewareOptions {
  handler: IMiddlewareHandler;
  path: string;
}

function resolveHandler(handler: string, options: Options) {
  try {
    // Note: check if it is a npm module
    resolveSync(handler, { basedir: options.rootDir });
    return handler;
  } catch (error) {
    throw new Error(`"${handler}" handler do not exist.`);
  }
}

export function normalizeServerMiddleware(
  middleware: IServerMiddleware,
  options: Options
): InternalServerMiddlewareOptions {
  let middlewareOptions: IServerMiddlewareOptions;
  if (typeof middleware !== 'object') {
    middlewareOptions = {
      handler: middleware
    };
  } else {
    middlewareOptions = middleware;
  }

  let handler: IMiddlewareHandler;
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
    path: middlewareOptions.path ?? '/:_(.*)'
  };
}
