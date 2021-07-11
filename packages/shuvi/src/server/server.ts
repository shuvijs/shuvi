import http from 'http';
import connect from 'connect';
import { Runtime } from '@shuvi/types';
import { matchPathname } from '@shuvi/router';
import { parse as parseUrl } from 'url';
import detectPort from 'detect-port';

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private _app: any;
  private _server: http.Server | null = null;

  constructor() {
    this._app = connect();

    this._app.use(
      (
        req: Runtime.IIncomingMessage,
        res: Runtime.IServerAppResponse,
        next: Runtime.IServerAppNext
      ) => {
        req.parsedUrl = parseUrl(req.url || '', true);
        next();
      }
    );
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

  use(fn: Runtime.IServerMiddlewareHandler): this;
  use(route: string, fn: Runtime.IServerMiddleware): this;
  use(route: any, fn?: any): this {
    if (fn) {
      this._app.use(function (
        req: Runtime.IIncomingMessage,
        res: Runtime.IServerAppResponse,
        next: Runtime.IServerAppNext
      ) {
        const matchedPath =
          req.parsedUrl.pathname &&
          matchPathname(route, req.parsedUrl.pathname);
        if (!matchedPath) return next(); // Note: not matched
        req.params = matchedPath.params;
        return fn(req, res, next);
      });
    } else {
      this._app.use(route);
    }
    return this;
  }

  getRequestHandler() {
    return this._app;
  }

  close() {
    return new Promise<void>((resolve, reject) =>
      this._server?.close(() => {
        resolve();
      })
    );
  }
}
