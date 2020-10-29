import path from 'path';
import { IServerMiddlewareConfig } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';
import { IServerMiddleware } from './types';
import { BUILD_SERVER_DIR } from '../constants';

export interface Options {
  rootDir: string;
  buildDir: string;
}

function resolvedHandler(name: string, options: Options) {
  try {
    // Note: attempt to resolve from npm
    return resolve.sync(name, { basedir: options.rootDir });
  } catch (error) {
    // Note: self defined middleware module
    return `${path.join(options.buildDir, BUILD_SERVER_DIR, name)}.js`;
  }
}

function resolveMiddleware(
  middleware: IServerMiddlewareConfig,
  options: Options
): IServerMiddleware {
  let route: string;
  let handlerPath: string;

  if (typeof middleware === 'object') {
    route = middleware.path;
    handlerPath = middleware.handler;
  } else if (typeof middleware === 'string') {
    route = '/'; // Note: for all routes
    handlerPath = middleware;
  } else {
    throw new Error(`Middleware must be one of type [string, object]`);
  }

  const resolvedHandlerPath = resolvedHandler(handlerPath, options);

  return {
    id: `${route} => ${handlerPath}`,
    path: route,
    handler: handlerPath,
    isNPM: resolvedHandlerPath.includes('node_modules'),
    get: () => {
      // Note: lazy require the middleware module
      const middlewareFn = require(resolvedHandlerPath);
      return middlewareFn.default || middlewareFn;
    }
  };
}

export function resolveServerMiddleware(
  serverMiddleware: IServerMiddlewareConfig[],
  options: Options
): IServerMiddleware[] {
  return serverMiddleware.map(middleware =>
    resolveMiddleware(middleware, options)
  );
}
