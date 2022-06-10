/// <reference types="@shuvi/platform-shared/src/types/shuvi-app" />

declare module '@shuvi/app/files/middlewareRoutes' {
  import { IMiddlewareRoutes } from '@shuvi/platform-web/lib/types';
  declare const middlewareRoutes: IMiddlewareRoutes[];
  export default middlewareRoutes;
}

declare module '@shuvi/app/files/routerConfig' {
  export const historyMode: 'browser' | 'hash';
}

declare module '@shuvi/app/files/routes' {
  import { IAppRouteConfigWithPrivateProps } from '@shuvi/platform-shared/lib/runtime';
  declare const routes: IAppRouteConfigWithPrivateProps[];
  export default routes;
}

declare module '@shuvi/app/files/apiRoutes' {
  import { IApiRoutes } from '@shuvi/platform-web/lib/types';
  declare const apiRoutes: IApiRoutes[];
  export default apiRoutes;
}

declare module '@shuvi/app/files/user/document' {
  import { IDocumentModule } from '@shuvi/platform-web/lib/types';
  declare const document: IDocumentModule;
  export default document;
}

declare module '@shuvi/app/files/user/server' {
  import { IServerModule } from '@shuvi/platform-web/lib/serverPlugin/hooks';
  declare const server: IServerModule;
  export default server;
}

declare module '@shuvi/app/files/page-loaders' {
  import { IRouteLoaderContext } from '@shuvi/platform-shared/lib/runtime';
  import { LoaderFunction } from '@shuvi/platform-web/shuvi-app/react/loader/types';
  // type LoaderFunction = (IRouteLoaderContext) => Promise<any>
  const loaders: Record<string, LoaderFunction>;
  export default loaders;
}
