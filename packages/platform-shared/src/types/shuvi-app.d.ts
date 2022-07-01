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
    IPageRouteRecord,
    IRawPageRouteRecord,
    IViewClient
  } from '@shuvi/platform-shared/src/runtime';

  export interface IGetRoutes {
    (routes: IRawPageRouteRecord[]): IPageRouteRecord[];
  }

  export const getRoutes: IGetRoutes;
  export const view: IViewClient;
  export const app: any;
}

declare module '@shuvi/app/core/plugins' {
  import { IPluginRecord } from '@shuvi/platform-shared/src/runtime/runtimeHooks';
  export const pluginRecord: IPluginRecord;
}

declare module '@shuvi/app/core/runtimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/src/runtime';
  declare const runtimneConfig: IRuntimeConfig | null;
  export default runtimneConfig;
}

declare module '@shuvi/app/core/setRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/src/runtime';
  export default function setRuntimeConfig(config: IRuntimeConfig): void;
}

declare module '@shuvi/app/core/setPublicRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/src/runtime';
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
  import { IRuntimeModule } from '@shuvi/platform-shared/src/runtime/lifecycle';
  export const onInit: IRuntimeModule['onInit'];
  export const getAppComponent: IRuntimeModule['getAppComponent'];
  export const getRootAppComponent: IRuntimeModule['getRootAppComponent'];
  export const getAppContext: IRuntimeModule['getAppContext'];
  export const onRenderDone: IRuntimeModule['onRenderDone'];
  export const onDispose: IRuntimeModule['onDispose'];
}
