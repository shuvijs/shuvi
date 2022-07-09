/// <reference types="@shuvi/platform-shared/src/shared/types/shuvi-app" />

declare module '@shuvi/app/files/routerConfig' {
  import { ILoaderOptions } from '@shuvi/platform-shared/shared/loader';
  export const historyMode: 'browser' | 'hash';
}

declare module '@shuvi/app/files/routes' {
  import { IRawPageRouteRecord } from '@shuvi/platform-shared/shared';
  declare const routes: IRawPageRouteRecord[];
  export default routes;
}

declare module '@shuvi/app/files/apiRoutes' {
  import { IApiRoutes } from '@shuvi/platform-web/esm/node/types';
  declare const apiRoutes: IApiRoutes[];
  export default apiRoutes;
}

declare module '@shuvi/app/files/middlewareRoutes' {
  import { IMiddlewareRoutes } from '@shuvi/platform-web/esm/node/types';
  declare const middlewareRoutes: IMiddlewareRoutes[];
  export default middlewareRoutes;
}

declare module '@shuvi/app/files/user/server' {
  import { IServerModule } from '@shuvi/platform-web/esm/node/types/shuvi-service';
  declare const server: IServerModule;
  export default server;
}

declare module '@shuvi/app/files/page-loaders' {
  import { IRouteLoaderContext } from '@shuvi/platform-shared/shared';
  import { Loader } from '@shuvi/platform-shared/shared';

  const loaders: Record<string, Loader>;
  export default loaders;
}
