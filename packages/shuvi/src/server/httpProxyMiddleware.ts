import { createProxyMiddleware } from 'http-proxy-middleware';
import {
  IServerProxyConfig,
  IServerProxyConfigItem,
  Runtime
} from '@shuvi/types';
import { Server } from './server';

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

export default function httpProxyMiddleware(
  server: Server,
  proxy: IServerProxyConfig
) {
  const proxyOptions = normalizeProxyConfig(proxy);
  proxyOptions.forEach(({ context, ...opts }) => {
    if (context) {
      server.use(
        createProxyMiddleware(context, opts) as Runtime.IServerMiddlewareHandler
      );
    } else {
      server.use(
        createProxyMiddleware(opts) as Runtime.IServerMiddlewareHandler
      );
    }
  });
}
