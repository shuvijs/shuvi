import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { extendedHooks } from './hooks';

export default createServerPlugin(
  {
    setup: ({ addHooks }) => {
      addHooks(extendedHooks);
    },
    serverMiddleware: context => {
      return server?.server?.serverMiddleware || [];
    },
    pageData: (appContext, context) => {
      return server?.server?.getPageData?.(appContext, context) || {};
    },
    renderToHTML: (renderToHTML, context) => {
      return server?.server?.renderToHTML?.(renderToHTML) || renderToHTML;
    },
    modifyHtml: (documentProps, appContext, context) => {
      return (
        server?.server?.modifyHtml?.(documentProps, appContext) || documentProps
      );
    },
    onViewDone: (params, context) => {
      server?.server?.onViewDone?.(params);
    },
    render: (renderAppToString, appContext, context) => {
      return server?.server?.render?.(renderAppToString, appContext);
    }
  },
  { order: -100, name: 'serverModule' }
);
