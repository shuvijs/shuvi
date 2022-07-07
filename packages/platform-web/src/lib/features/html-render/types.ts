import { extendedHooks } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomServerPluginHooks {
    pageData: typeof extendedHooks.pageData;
    handlePageRequest: typeof extendedHooks.handlePageRequest;
    modifyHtml: typeof extendedHooks.modifyHtml;
    addMiddleware: typeof extendedHooks.addMiddleware;
  }
}
