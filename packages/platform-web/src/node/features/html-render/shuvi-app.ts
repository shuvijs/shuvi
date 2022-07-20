import { extendedHooks } from './serverHooks';

// todo: node env type augmentations should use global ShuviService namespace
declare module '@shuvi/runtime' {
  export interface CustomAppContext {
    pageData?: any;
  }

  export interface CustomServerPluginHooks {
    getPageData: typeof extendedHooks.getPageData;
    handlePageRequest: typeof extendedHooks.handlePageRequest;
    modifyHtml: typeof extendedHooks.modifyHtml;
  }
}
