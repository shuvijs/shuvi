import { AsyncParallelHook } from '@shuvi/hook';
import { IAppContext } from '@shuvi/platform-shared/lib/runtime';
import type { IStoreManager } from '@shuvi/redox';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    storeManager?: IStoreManager;
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    pageData: AsyncParallelHook<void, IAppContext, Record<string, unknown>>;
  }
}

export type InitRedox = (params: {
  initialState: any;
  ctx: IAppContext;
}) => IStoreManager;

// export type CreateRedox = (
//   initialState: any,
//   ctx: IAppContext & {
//     isServer: boolean;
//   }
// ) => IStoreManager;

// declare module '@shuvi/user/plugin' {
//   export const createRedox: CreateRedox
// }
