// This is the shuvi server-side main module exports collection
import { default as pageRoutes } from '@shuvi/app/files/routes';
import { default as apiRoutes } from '@shuvi/app/files/apiRoutes';
import { default as middlewareRoutes } from '@shuvi/app/files/middlewareRoutes';
import { view } from '@shuvi/app/core/platform';
import * as server from '@shuvi/app/user/server';
import * as application from '../../app/server';

export { pageRoutes, apiRoutes, middlewareRoutes, server, view, application };
