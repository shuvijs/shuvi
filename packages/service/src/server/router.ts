import { getType, isFunction } from '@shuvi/utils';
import invariant from '@shuvi/utils/lib/invariant';
import { matchPathname } from '@shuvi/router';
import {
  IRequestHandlerWithNext,
  IErrorHandlerWithNext,
  IMiddlewareHandler,
  INextFunc,
  IRequest,
  IResponse
} from '../types/runtime';

interface RouteOptions {
  caseSensitive: boolean;
  // strict: boolean;
  end: boolean;
}

interface Route {
  path: string | undefined;
  handler: IMiddlewareHandler;
}

export interface Router {
  use(fn: IMiddlewareHandler): this;
  use(path: string, fn: IMiddlewareHandler): this;
  use(path: any, fn?: any): this;
  handleRequest(req: IRequest, res: IResponse, out: INextFunc): void;
}

class RouterImpl implements Router {
  private _options: RouteOptions;
  private _routes: Route[] = [];

  constructor(options: RouteOptions) {
    this._options = options;
    this.handleRequest = this.handleRequest.bind(this);
  }

  use(fn: IMiddlewareHandler): this;
  use(path: string, fn: IMiddlewareHandler): this;
  use(path: any, fn?: any): this {
    let handler: IMiddlewareHandler;
    let routePath: string | undefined;

    // first arg is the path
    if (!isFunction(path)) {
      routePath = path;
      handler = fn;
    } else {
      // default route to undefined
      routePath = undefined;
      handler = path;
    }

    invariant(
      isFunction(handler),
      `Router.use() requires a middleware function but got a ${getType(
        handler
      )}`
    );

    this._routes.push({ path: routePath, handler });

    return this;
  }

  handleRequest(req: IRequest, res: IResponse, out: INextFunc) {
    let index = 0;

    let done = (err: any) => out(err);

    const next: INextFunc = err => {
      // next callback
      const route = this._routes[index++];

      // all done
      if (!route) {
        // final function handler
        setImmediate(done, err);
        return;
      }

      const { path, handler } = route;

      let match = null;
      // just run middleware fn
      if (path === undefined) {
        match = {
          params: {}
        };
      } else {
        match = matchPathname(
          {
            path,
            caseSensitive: this._options.caseSensitive,
            end: this._options.end
          },
          req.pathname
        );
      }

      // skip this layer if the route doesn't match
      if (!match) {
        return next(err);
      }

      req.params = match.params;

      // call the route handler
      if (err) {
        this._callRouteErrorHandler(
          handler as IErrorHandlerWithNext,
          err,
          req,
          res,
          next
        );
      } else {
        this._callRouteRequestHandler(
          handler as IRequestHandlerWithNext,
          req,
          res,
          next
        );
      }
    };

    return next();
  }

  private _callRouteRequestHandler(
    handler: IRequestHandlerWithNext,
    req: IRequest,
    res: IResponse,
    next: INextFunc
  ) {
    if (handler.length > 3) {
      // not a standard request handler
      return next();
    }

    try {
      handler(req, res, next);
    } catch (err) {
      next(err);
    }
  }

  private _callRouteErrorHandler(
    handler: IErrorHandlerWithNext,
    error: any,
    req: IRequest,
    res: IResponse,
    next: INextFunc
  ) {
    if (handler.length !== 4) {
      // not a standard error handler
      return next(error);
    }

    try {
      handler(error, req, res, next);
    } catch (err) {
      next(err);
    }
  }
}

const defaultOptions = {
  caseSensitive: false,
  // strict: false,
  end: false
};

export function getRouter(options: Partial<RouteOptions> = {}): Router {
  return new RouterImpl({
    ...defaultOptions,
    ...options
  });
}
