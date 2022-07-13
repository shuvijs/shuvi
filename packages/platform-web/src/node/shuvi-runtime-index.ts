// exported by @shuvi/runtme

import { IRequestHandlerWithNext } from '@shuvi/service';

import { IApiRequestHandler } from './features/filesystem-routes/index';

export type MiddlewareHandler = IRequestHandlerWithNext;

export type APIHandler = IApiRequestHandler;
