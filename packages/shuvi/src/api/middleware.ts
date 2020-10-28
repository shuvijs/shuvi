import path from 'path';
import { IMiddlewareConfig } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';
import { IMiddleware } from './types';
import { BUILD_SERVER_DIR } from '../constants';

export interface ResolveMiddlewareOptions {
  rootDir: string;
  buildDir: string;
}

function resolvedHandler(name: string, options: ResolveMiddlewareOptions) {
  try {
    // Note: attempt to resolve from npm
    return resolve.sync(name, { basedir: options.rootDir });
  } catch (error) {
    // Note: self defined middleware module
    return `${path.join(options.buildDir, BUILD_SERVER_DIR, name)}.js`;
  }
}

function resolveMiddleware(
  middlewareConfig: IMiddlewareConfig,
  options: ResolveMiddlewareOptions
): IMiddleware {
  let route: string;
  let handlerPath: string;

  if (typeof middlewareConfig === 'object') {
    route = middlewareConfig.path;
    handlerPath = middlewareConfig.handler;
  } else if (typeof middlewareConfig === 'string') {
    route = '/'; // Note: for all routes
    handlerPath = middlewareConfig;
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

export function resolveMiddlewares(
  middlewares: IMiddlewareConfig[],
  options: ResolveMiddlewareOptions
): IMiddleware[] {
  return middlewares.map(middleware => resolveMiddleware(middleware, options));
}
