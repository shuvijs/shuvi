import { AsyncParallelHook } from '@shuvi/hook';
import type { IStoreManager } from '@shuvi/redox';
import { IAppContext } from '../../../../runtime';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    storeManager?: IStoreManager;
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    getPageData: AsyncParallelHook<void, IAppContext, Record<string, unknown>>;
  }
}
