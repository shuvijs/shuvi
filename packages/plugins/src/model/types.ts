import { AsyncParallelHook } from '@shuvi/hook';
import { IContext } from '@shuvi/platform-shared/lib/runtime';

declare module '@shuvi/runtime' {

  export interface CustomAppContext {
    store?: any;
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    pageData: AsyncParallelHook<void, IContext, Record<string, unknown>>;
  }
}
