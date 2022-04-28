import { AsyncParallelHook } from '@shuvi/hook';
import { IContext } from '@shuvi/platform-shared/lib/runtime';
import type { IModelManager } from '@shuvi/redox';

declare module '@shuvi/runtime' {

  export interface CustomAppContext {
    modelManager?: IModelManager;
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    pageData: AsyncParallelHook<void, IContext, Record<string, unknown>>;
  }
}
