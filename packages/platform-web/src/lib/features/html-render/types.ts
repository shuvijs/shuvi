import { extendedHooks } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomServerPluginHooks {
    pageData: typeof extendedHooks.pageData;
    renderToHTML: typeof extendedHooks.renderToHTML;
    modifyHtml: typeof extendedHooks.modifyHtml;
    addMiddleware: typeof extendedHooks.addMiddleware;
  }
}
