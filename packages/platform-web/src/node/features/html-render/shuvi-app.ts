export {};
// todo: node env type augmentations should use global ShuviService namespace
declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    pageData?: any;
  }
}
