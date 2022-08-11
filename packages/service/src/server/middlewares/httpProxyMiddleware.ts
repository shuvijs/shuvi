import {
  Options as ProxyOptions,
  Filter as ProxyFilter,
  createProxyMiddleware
} from 'http-proxy-middleware';
import { Server, IMiddlewareHandler } from '../http-server';

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

export function simplifyPathRewrite(proxy: IProxyConfigItem): IProxyConfigItem {
  const { context, target } = proxy;
  if (typeof context !== 'string' || typeof target !== 'string') {
    return proxy;
  }

  if (!context.endsWith('/*') || !target.endsWith('/*')) {
    return proxy;
  }

  const rawContext = context.replace(/\/\*$/, '');
  const rawTarget = target.replace(/\/\*$/, '');
  const rewriteContext = `^${rawContext}`;
  const originPathRewrite = proxy.pathRewrite || {};
  return {
    ...proxy,
    context: rawContext,
    target: rawTarget,
    pathRewrite: {
      ...originPathRewrite,
      [rewriteContext]: ''
    }
  };
}

function normalizeProxyConfig(proxyConfig: IProxyConfig): IProxyConfigItem[] {
  const proxies: IProxyConfigItem[] = [];

  if (Array.isArray(proxyConfig)) {
    proxyConfig.forEach(item => proxies.push(mergeDefaultProxyOptions(item)));
  } else if (typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([context, value]) => {
      let proxyConfigItem!: IProxyConfigItem;
      if (typeof value === 'string') {
        proxyConfigItem = simplifyPathRewrite({
          target: value,
          context
        });
      } else if (
        typeof value === 'object' &&
        typeof value.target === 'string'
      ) {
        proxyConfigItem = simplifyPathRewrite({
          ...value,
          context
        });
      } else {
        return;
      }

      proxies.push(mergeDefaultProxyOptions(proxyConfigItem));
    });
  }

  return proxies;
}

export function applyHttpProxyMiddleware(server: Server, proxy: IProxyConfig) {
  const proxyOptions = normalizeProxyConfig(proxy);
  proxyOptions.forEach(({ context, ...opts }) => {
    if (context) {
      server.use(
        createProxyMiddleware(context, opts) as any as IMiddlewareHandler
      );
    } else {
      server.use(createProxyMiddleware(opts) as any as IMiddlewareHandler);
    }
  });
}
