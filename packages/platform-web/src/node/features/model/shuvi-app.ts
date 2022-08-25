import type { RedoxStore } from '@shuvi/redox';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    store: RedoxStore;
  }
}
