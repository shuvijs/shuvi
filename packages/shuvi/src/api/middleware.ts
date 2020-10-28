import { IMiddlewareConfig } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';
import { IMiddleware } from './types';

export interface ResolveMiddlewareOptions {
  dir: string;
}

function resolveMiddleware(
  middlewareConfig: IMiddlewareConfig,
  resolveOptions: ResolveMiddlewareOptions
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

  // Note: make it relative
  handlerPath = handlerPath.startsWith('api/') ? `./${handlerPath}` : handlerPath;

  // TODO: webpack resolve
  handlerPath = resolve.sync(handlerPath, {
    basedir: resolveOptions.dir
  });
  const id = `${route} => ${handlerPath}`;
  let middlewareFn = require(handlerPath);
  middlewareFn = middlewareFn.default || middlewareFn;

  return {
    id,
    get: () => [route, middlewareFn]
  };
}

export function resolveMiddlewares(
  middlewares: IMiddlewareConfig[],
  options: ResolveMiddlewareOptions
): IMiddleware[] {
  return middlewares.map(middleware => resolveMiddleware(middleware, options));
}
