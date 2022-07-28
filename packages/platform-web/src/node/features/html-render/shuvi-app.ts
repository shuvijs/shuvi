// it's necessary. we need to turn it into a module
export {};

declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    pageData?: any;
  }
}
