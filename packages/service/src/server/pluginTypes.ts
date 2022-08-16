import { ShuviRequestHandler } from './shuviServerTypes';
import { IProxyConfigItem } from './middlewares/httpProxyMiddleware';

export interface IShuviServerMiddlewareConfig {
  path: string;
  handler: ShuviRequestHandler;
}

export type IServerMiddleware =
  | ShuviRequestHandler
  | IShuviServerMiddlewareConfig;

export type IProxy = IProxyConfigItem | IProxyConfigItem[];

export interface CustomServerPluginHooks
  extends ShuviService.CustomServerPluginHooks {}
