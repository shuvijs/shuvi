declare module '@shuvi/app/files/user/server' {
  import { IServerModule } from '@shuvi/platform-mp/lib/platform-mp-base/serverPlugin';
  declare const server: IServerModule;
  export default server;
}

declare module '@shuvi/app/files/runtimeConfig' {
  import { IRuntimeConfig } from '@shuvi/runtime-core';
  declare const runtimneConfig: IRuntimeConfig | null;
  export default runtimneConfig;
}

declare module '@shuvi/app/files/setRuntimeConfig' {
  import { IRuntimeConfig } from '@shuvi/runtime-core';
  export default function setRuntimeConfig(config: IRuntimeConfig): void;
}
