// This is the shuvi server-side main module exports collection
import * as application from '../../application/server/create-application-spa';
import * as server from '@shuvi/app/files/user/server';
import * as document from '@shuvi/app/files/user/document';
import { default as apiRoutes } from '@shuvi/app/files/apiRoutes';
const middlewareRoutes: any[] = [];
export { server, document, application, apiRoutes, middlewareRoutes };
export { view } from '@shuvi/app/core/platform';
