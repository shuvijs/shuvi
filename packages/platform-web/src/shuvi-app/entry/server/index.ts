// This is the shuvi server-side main module exports collection
import * as application from '../../app/server';
import * as server from '@shuvi/app/user/server';
import { default as apiRoutes } from '@shuvi/app/files/apiRoutes';
import { default as middlewareRoutes } from '@shuvi/app/files/middlewareRoutes';
export { server, application, apiRoutes, middlewareRoutes };
export { view } from '@shuvi/app/core/platform';
