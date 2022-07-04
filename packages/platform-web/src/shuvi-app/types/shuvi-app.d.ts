/// <reference types="@shuvi/platform-shared/src/types/shuvi-app" />

declare module '@shuvi/app/files/routerConfig' {
  import { ILoaderOptions } from '@shuvi/platform-shared/esm/runtime/loader';
  export const historyMode: 'browser' | 'hash';
}

declare module '@shuvi/app/files/routes' {
  import { IRawPageRouteRecord } from '@shuvi/platform-shared/esm/runtime';
  declare const routes: IRawPageRouteRecord[];
  export default routes;
}

declare module '@shuvi/app/files/apiRoutes' {
  import { IApiRoutes } from '@shuvi/platform-web/esm/types';
  declare const apiRoutes: IApiRoutes[];
  export default apiRoutes;
}

declare module '@shuvi/app/files/middlewareRoutes' {
  import { IMiddlewareRoutes } from '@shuvi/platform-web/esm/types';
  declare const middlewareRoutes: IMiddlewareRoutes[];
  export default middlewareRoutes;
}

declare module '@shuvi/app/files/user/document' {
  import { IDocumentModule } from '@shuvi/platform-web/esm/types/resources';
  declare const document: IDocumentModule;
  export default document;
}

declare module '@shuvi/app/files/user/server' {
  import { IServerModule } from '@shuvi/platform-web/esm/types/resources';
  declare const server: IServerModule;
  export default server;
}

declare module '@shuvi/app/files/page-loaders' {
  import { IRouteLoaderContext } from '@shuvi/platform-shared/esm/runtime';
  import { Loader } from '@shuvi/platform-shared/esm/runtime';

  const loaders: Record<string, Loader>;
  export default loaders;
}
