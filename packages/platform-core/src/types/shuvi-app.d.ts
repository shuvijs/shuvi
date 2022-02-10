declare module '@shuvi/app/core/platform' {
  import React from 'react';
  import {
    IApplicationCreaterBase,
    IAppRouteConfig,
    IAppRouteConfigWithPrivateProps,
    IViewClient,
    IAppComponent,
    IRouteComponent
  } from '@shuvi/platform-core';

  export interface IGetRoutes {
    (
      routes: IAppRouteConfigWithPrivateProps[],
      context: IApplicationCreaterBase
    ): IAppRouteConfig[];
  }

  export const getRoutes: IGetRoutes;
  export const view: IViewClient;
  export const app: IAppComponent<React.Component>;
  export const page404: IRouteComponent<React.Component>;
}

declare module '@shuvi/app/core/app' {
  const App: any;
  export default App;
}

declare module '@shuvi/app/core/plugins' {
  import { IPluginRecord } from '@shuvi/runtime-core';
  export const pluginRecord: IPluginRecord;
}

declare module '@shuvi/app/user/app' {
  const getUserAppComponent: <T>(appComponent: T) => T;
  export default getUserAppComponent;
}

declare module '@shuvi/app/user/runtime' {
  import { IRuntimeModule } from '@shuvi/runtime-core';
  export const onInit: IRuntimeModule['onInit'];
  export const getAppComponent: IRuntimeModule['getAppComponent'];
  export const getRootAppComponent: IRuntimeModule['getRootAppComponent'];
  export const getContext: IRuntimeModule['getContext'];
  export const onRenderDone: IRuntimeModule['onRenderDone'];
  export const onDispose: IRuntimeModule['onDispose'];
}
