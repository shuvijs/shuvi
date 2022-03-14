import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { extendedHooks } from './hooks';

export default createServerPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addMiddleware: () => {
    return server?.server?.middlewares || [];
  },
  pageData: (appContext, context) => {
    return server?.server?.getPageData?.(appContext, context) || {};
  },
  renderToHTML: (renderToHTML, context) => {
    return (
      server?.server?.renderToHTML?.(renderToHTML, context) || renderToHTML
    );
  },
  modifyHtml: (documentProps, appContext, context) => {
    return (
      server?.server?.modifyHtml?.(documentProps, appContext, context) ||
      documentProps
    );
  }
});
