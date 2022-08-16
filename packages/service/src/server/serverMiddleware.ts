import { resolve } from '@shuvi/utils/lib/resolve';
import { ShuviRequestHandler } from './shuviServerTypes';

interface Options {
  rootDir: string;
}

export interface IMiddlewareOptions {
  handler: string | ShuviRequestHandler;
  path?: string;
}

export type IServerMiddleware =
  | string
  | ShuviRequestHandler
  | IMiddlewareOptions;

interface InternalServerMiddlewareOptions extends IMiddlewareOptions {
  handler: ShuviRequestHandler;
  path: string;
}

function resolveHandler(handler: string, options: Options) {
  try {
    // Note: check if it is a npm module
    resolve(handler, { basedir: options.rootDir });
    return handler;
  } catch (error) {
    throw new Error(`"${handler}" handler do not exist.`);
  }
}

export function normalizeServerMiddleware(
  middleware: IServerMiddleware,
  options: Options
): InternalServerMiddlewareOptions {
  let middlewareOptions: IMiddlewareOptions;
  if (typeof middleware !== 'object') {
    middlewareOptions = {
      handler: middleware
    };
  } else {
    middlewareOptions = middleware;
  }

  let handler: ShuviRequestHandler;
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
