import { extendedHooks } from './hooks';

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof extendedHooks.pageData;
    renderToHTML: typeof extendedHooks.renderToHTML;
    modifyHtml: typeof extendedHooks.modifyHtml;
    addMiddleware: typeof extendedHooks.addMiddleware;
  }
}
