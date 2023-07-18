import { types } from 'util';
import { getType, isFunction } from '@shuvi/utils';
import invariant from '@shuvi/utils/invariant';
import { matchPathname } from '@shuvi/router';
import {
  IRequestHandlerWithNext,
  IErrorHandlerWithNext,
  IServerMiddlewareItem,
  IMiddlewareHandler,
  INextFunc,
  IRequest,
  IResponse
} from './serverTypes';
import { SERVER_REQUEST } from '@shuvi/shared/constants/trace';

interface RouteOptions {
  caseSensitive: boolean;
  // strict: boolean;
  end: boolean;
}

type Done = (err?: any) => void;

export interface Router {
  use(fn: IMiddlewareHandler): this;
  use(path: string, fn: IMiddlewareHandler): this;
  use(path: any, fn?: any): this;
  handleRequest(req: IRequest, res: IResponse, out: INextFunc): void;
}

class RouterImpl implements Router {
  private _options: RouteOptions;
  private _routes: IServerMiddlewareItem[] = [];

  constructor(options: RouteOptions) {
    this._options = options;
    this.handleRequest = this.handleRequest.bind(this);
  }

  use(fn: IMiddlewareHandler): this;
  use(path: string, fn: IMiddlewareHandler): this;
  use(path: any, fn?: any): this {
    let handler: IMiddlewareHandler;
    let routePath: string;

    // first arg is the path
    if (!isFunction(path)) {
      routePath = path;
      handler = fn;
    } else {
      // default route to '/'
      routePath = '/';
      handler = path;
    }

    invariant(
      isFunction(handler),
      `Router.use() requires a middleware function but got a ${getType(
        handler
      )}`
    );

    if (routePath === '*') {
      routePath = '/*';
    }
    this._routes.push({ path: routePath, handler });

    return this;
  }

  handleRequest(req: IRequest, res: IResponse, out: INextFunc) {
    const { serverRequestTrace } = req._traces;
    serverRequestTrace
      .traceChild(
        SERVER_REQUEST.events.SHUVI_SERVER_HANDLE_REQUEST_START.name,
        {
          [SERVER_REQUEST.events.SHUVI_SERVER_HANDLE_REQUEST_START.attrs
            .requestId]: req._requestId
        }
      )
      .stop();
    let index = 0;

    let done: Done = err => out(err);

    const next: INextFunc = err => {
      // next callback
      const route = this._routes[index++];

      // all done
      if (!route) {
        // final function handler
        this._handleError(done, err);
        return;
      }

      const { path, handler } = route;

      let match = null;
      // fast slash
      if (path === '/' && !this._options.end) {
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
          next,
          done
        );
      } else {
        this._callRouteRequestHandler(
          handler as IRequestHandlerWithNext,
          req,
          res,
          next,
          done
        );
      }
    };

    return next();
  }

  private _handleError(done: Done, err?: any) {
    setImmediate(done, err);
  }

  private _callRouteRequestHandler(
    handler: IRequestHandlerWithNext,
    req: IRequest,
    res: IResponse,
    next: INextFunc,
    done: INextFunc
  ) {
    if (handler.length > 3) {
      // not a standard request handler
      return next();
    }

    try {
      const result = handler(req, res, next);
      if (types.isPromise(result)) {
        result.catch(err => {
          this._handleError(done, err);
        });
      }
    } catch (err) {
      next(err);
    }
  }

  private _callRouteErrorHandler(
    handler: IErrorHandlerWithNext,
    error: any,
    req: IRequest,
    res: IResponse,
    next: INextFunc,
    done: Done
  ) {
    if (handler.length !== 4) {
      // not a standard error handler
      return next(error);
    }

    try {
      const result = handler(error, req, res, next);
      if (types.isPromise(result)) {
        result.catch(err => {
          this._handleError(done, err);
        });
      }
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
