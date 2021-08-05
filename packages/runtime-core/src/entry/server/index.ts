// This is the shuvi server-side main module exports collection
import * as server from '@shuvi/app/user/server';
import * as document from '@shuvi/app/user/document';
import * as application from '@shuvi/app/core/server/application';
import { default as apiRoutes } from '@shuvi/app/core/apiRoutes';
export { server, document, application, apiRoutes };
export { view } from '@shuvi/app/core/platform';
