// exported by @shuvi/runtime

import { IRequestHandlerWithNext } from '@shuvi/service';

import { IApiRequestHandler } from '../shared';

export type MiddlewareHandler = IRequestHandlerWithNext;

export type APIHandler = IApiRequestHandler;
