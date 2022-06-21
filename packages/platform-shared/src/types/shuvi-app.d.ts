declare module '@shuvi/app/core/app' {
  const App: any;
  export default App;
}

declare module '@shuvi/app/core/error' {
  const Error: any;
  export default Error;
}
declare module '@shuvi/app/core/platform' {
  import React from 'react';
  import {
    IAppContext,
    IPageRouteRecord,
    IRawPageRouteRecord,
    IViewClient,
    IAppComponent,
    IRouteComponent,
    IRouteData
  } from '@shuvi/platform-shared/src/runtime';

  export interface IGetRoutes {
    (routes: IRawPageRouteRecord[]): IPageRouteRecord[];
  }

  export const getRoutes: IGetRoutes;
  export const view: IViewClient;
  export const app: IAppComponent<React.Component>;
  export const page404: IRouteComponent<React.Component>;
}

declare module '@shuvi/app/core/plugins' {
  import { IPluginRecord } from '@shuvi/platform-shared/lib/runtime/runtimeHooks';
  export const pluginRecord: IPluginRecord;
}

declare module '@shuvi/app/core/runtimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/lib/runtime';
  declare const runtimneConfig: IRuntimeConfig | null;
  export default runtimneConfig;
}

declare module '@shuvi/app/core/setRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/lib/runtime';
  export default function setRuntimeConfig(config: IRuntimeConfig): void;
}

declare module '@shuvi/app/core/setPublicRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/lib/runtime';
  export default function setPublicRuntimeConfig(config: IRuntimeConfig): void;
}

declare module '@shuvi/app/user/app' {
  const UserAppComponent: any;
  export default UserAppComponent;
}

declare module '@shuvi/app/user/error' {
  const Error: any;
  export default Error;
}

declare module '@shuvi/app/user/runtime' {
  import { IRuntimeModule } from '@shuvi/platform-shared/lib/runtime/lifecycle';
  export const onInit: IRuntimeModule['onInit'];
  export const getAppComponent: IRuntimeModule['getAppComponent'];
  export const getRootAppComponent: IRuntimeModule['getRootAppComponent'];
  export const getAppContext: IRuntimeModule['getAppContext'];
  export const onRenderDone: IRuntimeModule['onRenderDone'];
  export const onDispose: IRuntimeModule['onDispose'];
}

declare module '@shuvi/app/files/page-loaders' {
  import { IRouteLoaderContext } from '@shuvi/platform-shared/lib/runtime';
  import { LoaderFn } from '@shuvi/platform-shared/lib/runtime/loader';
  // type LoaderFunction = (IRouteLoaderContext) => Promise<any>
  const loaders: Record<string, LoaderFn>;
  export default loaders;
}

declare module '@shuvi/app/files/routerConfig' {
  import { ILoaderOptions } from '@shuvi/platform-shared/lib/runtime/loader';
  export const historyMode: 'browser' | 'hash';
  export const loaderOptions: ILoaderOptions;
}
