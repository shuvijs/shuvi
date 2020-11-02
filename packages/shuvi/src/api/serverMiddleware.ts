import path from 'path';
import { IServerMiddlewareConfig } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';

export interface Options {
  rootDir: string;
  srcDir: string;
}

export function resolveHandler(name: string, options: Options) {
  try {
    // Note: just check if it is a npm module
    resolve.sync(name, { basedir: options.rootDir });
    return name;
  } catch (error) {
    // Note: self defined middleware module
    return `${path.join(options.srcDir, name)}`;
  }
}

export function normalizeServerMiddleware(
  middleware: IServerMiddlewareConfig
): { path: string; handler: string } {
  let path: string;
  let handler: string;

  if (typeof middleware === 'object') {
    path = middleware.path;
    handler = middleware.handler;
  } else if (typeof middleware === 'string') {
    path = '/'; // Note: match all routes
    handler = middleware;
  } else {
    throw new Error(`Middleware must be one of type [string, object]`);
  }

  return { path, handler };
}
