/// <reference types="@shuvi/platform-shared/shuvi-type-extensions-runtime" />

declare module '@shuvi/app/files/routes' {
  import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
  declare const routes: IPageRouteRecord[];
  export default routes;
}

declare module '@shuvi/app/files/routerConfig' {
  export const historyMode: 'browser' | 'hash';
}

declare module '@shuvi/app/files/page-loaders' {
  import { IRouteLoaderContext, Loader } from '@shuvi/platform-shared/shared';

  const loaders: Record<string, Loader>;
  export default loaders;
}

declare module '@shuvi/app/files/apiRoutes' {
  import { IApiRoutes } from '@shuvi/platform-web/shared';

  declare const apiRoutes: IApiRoutes[];
  export default apiRoutes;
}

declare module '@shuvi/app/files/middlewareRoutes' {
  import { IMiddlewareRoutes } from '@shuvi/platform-web/shared';

  declare const middlewareRoutes: IMiddlewareRoutes[];
  export default middlewareRoutes;
}

declare module '@shuvi/app/user/server' {
  export {};
}
