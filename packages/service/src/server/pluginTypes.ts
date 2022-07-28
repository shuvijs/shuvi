import { IServerMiddlewareItem } from './http-server';
import { IProxyConfigItem } from './middlewares/httpProxyMiddleware';

export type IServerMiddleware =
  | IServerMiddlewareItem
  | IServerMiddlewareItem['handler'];

export type IProxy = IProxyConfigItem | IProxyConfigItem[];

export interface CustomServerPluginHooks
  extends ShuviService.CustomServerPluginHooks {}
