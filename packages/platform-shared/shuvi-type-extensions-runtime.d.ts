declare module '@shuvi/app/core/entry' {
  export {};
}

declare module '@shuvi/app/core/error' {
  const Error: any;
  export default Error;
}

declare module '@shuvi/app/core/platform' {
  import { IPageRouteRecord, IViewClient } from '@shuvi/platform-shared/shared';

  export interface IGetRoutes {
    (routes: IPageRouteRecord[]): IPageRouteRecord[];
  }

  export const getRoutes: IGetRoutes;
  export const view: IViewClient;
  export const app: any;
}

declare module '@shuvi/app/core/plugins' {
  import { IPluginRecord } from '@shuvi/platform-shared/shared/runtimeHooks';
  export const pluginRecord: IPluginRecord;
}

declare module '@shuvi/app/core/runtimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/shared';
  const runtimneConfig: IRuntimeConfig | null;
  export default runtimneConfig;
}

declare module '@shuvi/app/core/setRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/shared';
  export default function setRuntimeConfig(config: IRuntimeConfig): void;
}

declare module '@shuvi/app/core/setPublicRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/platform-shared/shared';
  export default function setPublicRuntimeConfig(config: IRuntimeConfig): void;
}

declare module '@shuvi/app/user/error' {
  const Error: any;
  export default Error;
}

declare module '@shuvi/app/user/app' {
  import { IAppModule } from '@shuvi/platform-shared/shared/lifecycle';
  export const init: IAppModule['init'];
  export const appComponent: IAppModule['appComponent'];
  export const appContext: IAppModule['appContext'];
  export const dispose: IAppModule['dispose'];
}
