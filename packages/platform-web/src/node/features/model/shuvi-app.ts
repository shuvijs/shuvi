import type { IStoreManager } from '@shuvi/redox';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    storeManager?: IStoreManager;
  }
}
