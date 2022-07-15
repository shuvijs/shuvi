import { extendedHooks } from './serverHooks';

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
