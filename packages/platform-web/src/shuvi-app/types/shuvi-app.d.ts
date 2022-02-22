/// <reference types="@shuvi/platform-core/src/types/shuvi-app" />

declare module '@shuvi/app/files/middlewareRoutes' {
  import { IMiddlewareRoutes } from '@shuvi/platform-web/lib/types';
  declare const middlewareRoutes: IMiddlewareRoutes[];
  export default middlewareRoutes;
}

declare module '@shuvi/app/files/routerConfig' {
  export const historyMode: 'browser' | 'hash';
}

declare module '@shuvi/app/files/routes' {
  import { IAppRouteConfigWithPrivateProps } from '@shuvi/platform-core';
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

declare module '@shuvi/app/files/runtimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-core';
  declare const runtimneConfig: IRuntimeConfig | null;
  export default runtimneConfig;
}

declare module '@shuvi/app/files/setRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-core';
  export default function setRuntimeConfig(config: IRuntimeConfig): void;
}