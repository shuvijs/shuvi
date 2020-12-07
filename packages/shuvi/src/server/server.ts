import http from 'http';
import Koa from 'koa';
import c2k from 'koa-connect';
import {
  IServerProxyConfig,
  IServerProxyConfigItem,
  Runtime
} from '@shuvi/types';
import { matchPathname } from '@shuvi/router';
import { parse as parseUrl } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import detectPort from 'detect-port';

interface IServerOptions {
  proxy?: IServerProxyConfig;
}

function mergeDefaultProxyOptions(
  config: Partial<IServerProxyConfigItem>
): IServerProxyConfigItem {
  return {
    logLevel: 'silent',
    secure: false,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    ...config
  };
}

function normalizeProxyConfig(
  proxyConfig: IServerProxyConfig
): IServerProxyConfigItem[] {
  const res: IServerProxyConfigItem[] = [];

  if (Array.isArray(proxyConfig)) {
    proxyConfig.forEach(item => res.push(mergeDefaultProxyOptions(item)));
  } else if (typeof proxyConfig === 'object') {
    Object.keys(proxyConfig).forEach(context => {
      const val = proxyConfig[context];
      const opts =
        typeof val === 'string'
          ? {
              target: val,
              context
            }
          : {
              ...val,
              context
            };
      res.push(mergeDefaultProxyOptions(opts));
    });
  }

  return res;
}

export class Server {
  hostname: string | undefined;
  port: number | undefined;
  private _app: Runtime.IServerApp;
  private _server: http.Server | null = null;

  constructor(options: IServerOptions = {}) {
    this._app = new Koa();

    if (options.proxy) {
      this._setupProxy(options.proxy);
    }
    this._app.use(async (ctx, next) => {
      (ctx.req as Runtime.IIncomingMessage).parsedUrl = parseUrl(
        ctx.request.url || '',
        true
      );
      await next();
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

  use(fn: Runtime.IServerAppMiddleware): this;
  use(route: string, fn: Runtime.IServerAppMiddleware): this;
  use(route: any, fn?: any): this {
    if (fn) {
      this._app.use(async (ctx, next) => {
        const matchedPath = matchPathname(route, ctx.request.path);
        if (!matchedPath) return await next(); // Note: not matched
        ctx.params = matchedPath.params;
        await fn(ctx, next);
      });
    } else {
      this._app.use(route);
    }
    return this;
  }

  getRequestHandler() {
    return this._app.callback();
  }

  close() {
    return new Promise<void>((resolve, reject) =>
      this._server?.close(() => {
        resolve();
      })
    );
  }

  private _setupProxy(proxy: IServerProxyConfig) {
    const proxyOptions = normalizeProxyConfig(proxy);
    proxyOptions.forEach(({ context, ...opts }) => {
      if (context) {
        this._app.use(c2k(createProxyMiddleware(context, opts) as any));
      } else {
        this._app.use(c2k(createProxyMiddleware(opts) as any));
      }
    });
  }
}
