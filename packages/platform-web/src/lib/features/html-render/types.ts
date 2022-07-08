import { extendedHooks } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomServerPluginHooks {
    middlewares: typeof extendedHooks.middlewares;
    getPageData: typeof extendedHooks.getPageData;
    handlePageRequest: typeof extendedHooks.handlePageRequest;
    modifyHtml: typeof extendedHooks.modifyHtml;
  }
}
