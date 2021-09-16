import http from 'http';
import { parse as parseUrl } from 'url';
import { IRequest, IResponse } from '../lib/apiRouteHandler';
import { getType, isFunction } from '@shuvi/utils';
import { parseQuery } from '@shuvi/router';
import invariant from '@shuvi/utils/lib/invariant';
import detectPort from 'detect-port';
import { sendHTML } from '../lib/utils';
import { getRouter, Router } from './router';
import {
  IMiddlewareHandler,
  IRequestHandlerWithNext,
  INextFunc
} from './serverTypes';

const prepareReq: IRequestHandlerWithNext = (req, res, next) => {
  const url = parseUrl(req.url, false);

  req.query = url.query ? parseQuery(url.query) : {};
  req.pathname = url.pathname || '/';
  req.params = {};

  next();
};

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private _server: http.Server | null = null;
  private _router: Router;

  constructor() {
    this._router = this._setupRouter();
    this._handleRequest = this._handleRequest.bind(this);
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
      `Server.use() requires a middleware function but got a ${getType(
        handler
      )}`
    );

    this._router.use(routePath, handler);
    return this;
  }

  getRequestHandler() {
    return this._handleRequest;
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
    return new Promise<void>((resolve, reject) => {
      if (!this._server) {
        resolve();
        return;
      }

      this._server.close(err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  private _setupRouter(): Router {
    const router = getRouter();
    router.use(prepareReq);
    return router;
  }

  private _handleRequest(req: any, res: any, next?: INextFunc) {
    this._router.handleRequest(
      req,
      res,
      next || ((err: any) => this._finalhandler(req, res, err))
    );
  }

  private _finalhandler = (req: IRequest, res: IResponse, error?: any) => {
    let msg;

    // ignore 404 on in-flight response
    if (!error && res.headersSent) {
      return;
    }

    // unhandled error
    if (error) {
      setImmediate(function () {
        console.error(
          `server error: ${req.url} `,
          error.stack || error.toString()
        );
      });

      // fallback to status code on response
      res.statusCode = error.status || error.statusCode || 500;

      // get error message
      msg =
        process.env.NODE_ENV === 'production'
          ? 'Server Render Error' // Note: should not expose error stack in prod
          : `Server Render Error\n\n${error.stack}`;
    } else {
      // not found
      res.statusCode = 404;
      msg = `Cannot ${req.method} {req.url}`;
    }

    // cannot actually respond
    if (res.headersSent) {
      req.socket.destroy();
      return;
    }

    // send response
    return sendHTML(req, res, msg);
  };

  private async _checkPort(port: number) {
    const _port = await detectPort(port);
    if (_port !== port) {
      const error = new Error(`Port ${port} is being used.`);
      Object.assign(error, { code: 'EADDRINUSE' });
      throw error;
    }
  }
}
