import { IStoreManager } from '@shuvi/redox';

// it's necessary. we need to turn it into a module
export {};

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: IStoreManager;
  }
}
