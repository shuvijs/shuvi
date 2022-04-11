import { createAsyncParallelHook } from '@shuvi/hook';

export type StoreOptions = {
  subscribe?: boolean;
};

declare module '@shuvi/platform-shared/lib/runtime' {
  interface IContext {
    store: any;
    pageData: any;
  }
}

import { IContext } from '@shuvi/platform-shared/lib/runtime';
const pageData = createAsyncParallelHook<
  void,
  IContext,
  Record<string, unknown>
>();

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof pageData;
  }
}
