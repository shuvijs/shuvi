import http from 'http';
import { Runtime } from '@shuvi/types';
import { asyncCall } from '../lib/utils';
import { matchPathname } from '@shuvi/router';
import { parse as parseUrl } from 'url';
import detectPort from 'detect-port';

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

  use(fn: Runtime.IServerMiddlewareHandler): Server;
  use(route: string, fn: Runtime.IServerMiddlewareHandler): Server;
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
      if (typeof handler.path === 'string') {
        this.middlewares.push(handler);
      }
      const server = handler;
      handler = function (
        req: Runtime.IIncomingMessage,
        res: Runtime.IServerAppResponse,
        next: Runtime.IServerAppNext
      ) {
        return server.handler(req, res, next);
      };
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

    if (!req.parsedUrl) req.parsedUrl = parseUrl(req.url || '', true);

    const next = (err?: any): void => {
      // next callback
      const middleware = this.middlewares[index++];

      // all done
      if (!middleware) {
        // final function handler
        asyncCall(out || this.finalhandler, req, res, err);
        return;
      }

      const path = middleware.path;

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

    try {
      if (err && arity === 4) {
        // error-handling middleware
        (middlewareHandler as Runtime.ErrorHandleFunction)(err, req, res, next);
        return;
      } else if (!err && arity < 4) {
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

  finalhandler = (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    error?: any
  ) => {
    let msg;
    let status;

    // ignore 404 on in-flight response
    if (!error && res.headersSent) {
      return;
    }

    // unhandled error
    if (error) {
      asyncCall(function () {
        console.error(
          `server error: ${req.url} `,
          error.stack || error.toString()
        );
      });

      status = error.status || error.statusCode;

      if (status === undefined) {
        // fallback to status code on response
        status = 500;
      }

      // get error message
      msg =
        process.env.NODE_ENV === 'production'
          ? 'Server Render Error' // Note: should not expose error stack in prod
          : `Server Render Error\n\n${error.stack}`;
    } else {
      // not found
      status = 404;
      msg = `Cannot  ${req.method} {req.url}`;
    }

    // cannot actually respond
    if (res.headersSent) {
      req.socket.destroy();
      return;
    }

    // send response
    this.send(req, res, status, msg);
  };

  send = (
    req: Runtime.IIncomingMessage,
    res: Runtime.IServerAppResponse,
    status: number,
    msg: string
  ) => {
    // response status
    res.statusCode = status;

    // standard headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', Buffer.byteLength(msg, 'utf8'));

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.end(msg, 'utf8');
  };

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

  close() {
    return new Promise<void>((resolve, reject) =>
      this._server?.close(() => {
        resolve();
      })
    );
  }
}
