/// <reference types="@shuvi/platform-shared/src/shared/types/shuvi-app" />

declare module '@shuvi/app/files/user/server' {
  import { IServerModule } from '@shuvi/platform-mp/lib/platform-mp-base/serverPlugin';
  declare const server: IServerModule;
  export default server;
}
