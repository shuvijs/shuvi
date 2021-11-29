// This is the shuvi server-side main module exports collection
import * as application from '../../application/server/create-application';
import * as server from '@shuvi/app/user/server';
import * as document from '@shuvi/app/user/document';
import { default as apiRoutes } from '@shuvi/app/core/apiRoutes';
import { default as middlewareRoutes } from '@shuvi/app/core/middlewareRoutes';
export { server, document, application, apiRoutes, middlewareRoutes };
export { view } from '@shuvi/app/core/platform';
