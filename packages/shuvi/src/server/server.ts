import http from 'http';
import finalhandler from 'finalhandler';
import { Runtime } from '@shuvi/types';
import { matchPathname } from '@shuvi/router';
import { parse as parseUrl } from 'url';
import detectPort from 'detect-port';

const defer =
  typeof setImmediate === 'function'
    ? setImmediate
    : function (fn: any) {
        process.nextTick(fn.bind.apply(fn, arguments));
      };

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private middlewares: Runtime.IServerMiddlewareItem[];
  private _server: http.Server | null = null;

  constructor() {
    this.middlewares = [];
    this.call = this.call.bind(this);
    this.middlewareHandler = this.middlewareHandler.bind(this);
  }

  async _checkPort(port: number) {
    const _port = await detectPort(port);
    if (_port !== port) {
      const error = new Error(`Port ${port} is being used.`);
      Object.assign(error, { code: 'EADDRINUSE' });
      throw error;
    }
  }

  async listen(port: number, hostname?: string): Promise<void> {
    if (this._server) {
      return;
    }

    await this._checkPort(port);

    this.hostname = hostname;
    this.port = port;

    const srv = (this._server = http.createServer(this.getRequestHandler()));
    await new Promise((resolve, reject) => {
      // This code catches EADDRINUSE error if the port is already in use
      srv.on('error', reject);
      srv.on('listening', resolve);
      srv.listen(port, hostname);
    });
  }

  use(fn: Runtime.IServerMiddlewareHandler): Server;
  use(route: string, fn: Runtime.IServerMiddleware): Server;
  use(route: any, fn?: any): Server {
    let handler = fn;
    let path = route;

    // default route to '/'
    if (typeof route !== 'string') {
      handler = route;
      path = ':matchAll(.*)';
    }

    // wrap sub-apps
    if (typeof handler.handler === 'function') {
      const server = handler;
      server.path = path;
      handler = function (
        req: Runtime.IIncomingMessage,
        res: Runtime.IServerAppResponse,
        next: Runtime.IServerAppNext
      ) {
        return server.handler(req, res, next);
      };
    }

    // wrap vanilla http.Servers
    if (handler instanceof http.Server) {
      handler = handler.listeners('request')[0];
    }

    // add the middleware
    this.middlewares.push({ path, handler });

    return this;
  }

  getRequestHandler() {
    return this.middlewareHandler as http.RequestListener;
  }

  middlewareHandler(
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    out?: (
      req: Runtime.IIncomingMessage,
      res: Runtime.IServerAppResponse
    ) => void
  ) {
    let index = 0;

    // final function handler
    const done = out || finalhandler(req, res);

    const next = (err?: any): void => {
      // next callback
      const middleware = this.middlewares[index++];

      // all done
      if (!middleware) {
        defer(done, err);
        return;
      }

      const path = middleware.path;

      if (!req.parsedUrl) req.parsedUrl = parseUrl(req.url || '', true);

      // route data
      const matchedPath =
        req.parsedUrl.pathname && matchPathname(path, req.parsedUrl.pathname);

      // skip this layer if the route doesn't match
      if (!matchedPath) return next(err);
      req.params = matchedPath.params;

      // call the layer handler
      return this.call(middleware.handler, path, err, req, res, next);
    };

    return next();
  }

  call(
    middlewareHandler: Runtime.IServerMiddlewareHandler,
    path: string,
    err: any,
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    next: Runtime.IServerAppNext
  ) {
    const arity = middlewareHandler.length;
    let error = err;
    const hasError = Boolean(err);

    try {
      if (hasError && arity === 4) {
        // error-handling middleware
        (middlewareHandler as Runtime.ErrorHandleFunction)(err, req, res, next);
        return;
      } else if (!hasError && arity < 4) {
        // request-handling middleware
        (middlewareHandler as Runtime.NextHandleFunction)(req, res, next);
        return;
      }
    } catch (e) {
      // replace the error
      error = e;
    }

    // continue
    next(error);
  }

  close() {
    return new Promise<void>((resolve, reject) =>
      this._server?.close(() => {
        resolve();
      })
    );
  }
}
