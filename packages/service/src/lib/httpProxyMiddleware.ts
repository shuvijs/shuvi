import {
  Options as ProxyOptions,
  Filter as ProxyFilter,
  createProxyMiddleware
} from 'http-proxy-middleware';
import { Server } from '../server/server';
import { IMiddlewareHandler } from '../server/serverTypes';

export interface IProxyConfigItem extends ProxyOptions {
  context?: ProxyFilter;
}

export type IProxyConfig =
  | Record<string, string | Omit<IProxyConfigItem, 'context'>>
  | IProxyConfigItem[];

function mergeDefaultProxyOptions(
  config: Partial<IProxyConfigItem>
): IProxyConfigItem {
  return {
    logLevel: 'silent',
    secure: false,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    ...config
  };
}
function normalizeProxyConfig(proxyConfig: IProxyConfig): IProxyConfigItem[] {
  const res: IProxyConfigItem[] = [];

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

export function applyHttpProxyMiddleware(server: Server, proxy: IProxyConfig) {
  const proxyOptions = normalizeProxyConfig(proxy);
  proxyOptions.forEach(({ context, ...opts }) => {
    if (context) {
      server.use(createProxyMiddleware(context, opts) as IMiddlewareHandler);
    } else {
      server.use(createProxyMiddleware(opts) as IMiddlewareHandler);
    }
  });
}
