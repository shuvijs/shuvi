import { Doura } from 'doura';

// it's necessary. we need to turn it into a module
export {};

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: Doura;
  }
}

declare global {
  const __BROWSER__: boolean;
}
