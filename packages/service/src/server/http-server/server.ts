import * as http from 'http';
import { parse as parseUrl } from 'url';
import { parseQuery } from '@shuvi/router';
import logger from '@shuvi/utils/lib/logger';
import detectPort from 'detect-port';
import { sendHTML } from '../utils';
import { getRouter, Router } from './router';
import {
  IResponse,
  IRequest,
  IMiddlewareHandler,
  IRequestHandlerWithNext,
  INextFunc
} from './serverTypes';

const prepareReq: IRequestHandlerWithNext = (req, res, next) => {
  const url = parseUrl(req.url, false);

  req.pathname = url.pathname || '/';
  req.query = url.query ? parseQuery(url.query) : {};
  req.params = {};

  next();
};

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private _server: http.Server | null = null;
  private _router: Router;
  private _upgradeListener: ((...args: any[]) => void) | null = null;

  constructor() {
    this._listenUncaughtException();
    this._router = this._setupRouter();
    this._handleRequest = this._handleRequest.bind(this);
  }

  use<Req extends IRequest = IRequest, Res extends IResponse = IResponse>(
    fn: IMiddlewareHandler<Req, Res>
  ): this;
  use<Req extends IRequest = IRequest, Res extends IResponse = IResponse>(
    path: string,
    fn: IMiddlewareHandler<Req, Res>
  ): this;
  use(a: any, b?: any): this {
    this._router.use(a, b);
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
      if (this._upgradeListener) {
        srv.on('upgrade', this._upgradeListener);
      }
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

  onUpgrade(listener: (...args: any[]) => void) {
    this._upgradeListener = listener;
  }

  private _listenUncaughtException() {
    process.on('exception', (err, origin) => {
      console.error(
        `Caught exception: \n`,
        err,
        '\n',
        `Exception origin: \n`,
        origin,
        '\n'
      );
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
        logger.error(
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
      msg = `Cannot handleRequest ${req.method} ${req.url}`;
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
