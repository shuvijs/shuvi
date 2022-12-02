import type { Doura } from 'doura';

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    store: Doura;
  }
}
