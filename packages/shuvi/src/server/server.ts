import http from 'http';
import { IServerProxyConfig, IServerProxyConfigItem } from '@shuvi/types';
import { parse as parseUrl } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import Connect from 'connect';
import {
  IConnect,
  IIncomingMessage,
  IServerResponse,
  INextFunction,
  IHTTPRequestHandler,
  IHandleFunction
} from './types';

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
  private _connect: IConnect;
  private _server: http.Server | null = null;

  constructor(options: IServerOptions = {}) {
    this._connect = Connect();

    if (options.proxy) {
      this._setupProxy(options.proxy);
    }
    this._connect.use(
      (req: IIncomingMessage, _res: IServerResponse, next: INextFunction) => {
        req.parsedUrl = parseUrl(req.url || '', true);
        next();
      }
    );
  }

  async listen(port: number, hostname?: string): Promise<void> {
    if (this._server) {
      return;
    }

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

  use(fn: IHandleFunction): this;
  use(route: string, fn: IHandleFunction): this;
  use(route: any, fn?: any): this {
    this._connect.use(route, fn);
    return this;
  }

  getRequestHandler(): IHTTPRequestHandler {
    return this._connect;
  }

  close() {
    this._server?.close();
  }

  private _setupProxy(proxy: IServerProxyConfig) {
    const proxyOptions = normalizeProxyConfig(proxy);
    proxyOptions.forEach(({ context, ...opts }) => {
      if (context) {
        this._connect.use(
          createProxyMiddleware(context, opts) as IHandleFunction
        );
      } else {
        this._connect.use(createProxyMiddleware(opts) as IHandleFunction);
      }
    });
  }
}
