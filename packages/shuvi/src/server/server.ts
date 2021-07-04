import http from 'http';
import connect from 'connect';
// import c2k from 'koa-connect';
import {
  IServerProxyConfig,
  // IServerProxyConfigItem,
  Runtime
} from '@shuvi/types';
import { matchPathname } from '@shuvi/router';
import { parse as parseUrl } from 'url';
// import { createProxyMiddleware } from 'http-proxy-middleware';
import detectPort from 'detect-port';

interface IServerOptions {
  proxy?: IServerProxyConfig;
}

// function mergeDefaultProxyOptions(
//   config: Partial<IServerProxyConfigItem>
// ): IServerProxyConfigItem {
//   return {
//     logLevel: 'silent',
//     secure: false,
//     changeOrigin: true,
//     ws: true,
//     xfwd: true,
//     ...config
//   };
// }

// function normalizeProxyConfig(
//   proxyConfig: IServerProxyConfig
// ): IServerProxyConfigItem[] {
//   const res: IServerProxyConfigItem[] = [];
//
//   if (Array.isArray(proxyConfig)) {
//     proxyConfig.forEach(item => res.push(mergeDefaultProxyOptions(item)));
//   } else if (typeof proxyConfig === 'object') {
//     Object.keys(proxyConfig).forEach(context => {
//       const val = proxyConfig[context];
//       const opts =
//         typeof val === 'string'
//           ? {
//               target: val,
//               context
//             }
//           : {
//               ...val,
//               context
//             };
//       res.push(mergeDefaultProxyOptions(opts));
//     });
//   }
//
//   return res;
// }

interface IServerApp extends Omit<Runtime.IServerApp, 'use'>{
  (req:  http.IncomingMessage, res: http.ServerResponse, next?: Function): void;
  use(fn: Runtime.IServerMiddlewareHandler): this;
  use(route: string, fn: Runtime.IServerMiddleware): this;
  // handle(req: Runtime.IServerAppRequest, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext): void;
}

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private _app: IServerApp;
  private _server: http.Server | null = null;

  constructor(options: IServerOptions = {}) {
    this._app = connect();

    if (options.proxy) {
      this._setupProxy(options.proxy);
    }
    this._app.use((req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) => {
      req.parsedUrl = parseUrl(
        req.url || '',
        true
      );
      next();
    });
    this._app.on('error', (err, ctx) => {
      // Note: Koa error-handling logic such as centralized logging
      console.error(`server error: ${ctx.request.url} `, err);
    });
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
      this._app.use(function(req: Runtime.IIncomingMessage, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext) {
        const matchedPath = req.url && matchPathname(route, req.url);
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

  private _setupProxy(proxy: IServerProxyConfig) {
    // const proxyOptions = normalizeProxyConfig(proxy);
    // proxyOptions.forEach(({ context, ...opts }) => {
    //   if (context) {
    //     this._app.use(c2k(createProxyMiddleware(context, opts) as any));
    //   } else {
    //     this._app.use(c2k(createProxyMiddleware(opts) as any));
    //   }
    // });
  }
}
