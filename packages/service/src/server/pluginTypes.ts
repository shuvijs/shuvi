import { IServerMiddlewareItem } from './http-server';

export type IServerMiddleware =
  | IServerMiddlewareItem
  | IServerMiddlewareItem['handler'];
