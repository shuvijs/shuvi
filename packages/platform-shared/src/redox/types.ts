import { AsyncParallelHook } from '@shuvi/hook';
import type { IStoreManager } from '@shuvi/redox';
import { IAppContext } from '../runtime';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    storeManager?: IStoreManager;
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    pageData: AsyncParallelHook<void, IAppContext, Record<string, unknown>>;
  }
}

// export type CreateRedox = (
//   initialState: any,
//   ctx: IAppContext & {
//     isServer: boolean;
//   }
// ) => IStoreManager;

// declare module '@shuvi/user/plugin' {
//   export const createRedox: CreateRedox
// }
