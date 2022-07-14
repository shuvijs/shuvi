import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { extendedHooks } from './hooks';

export default createServerPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  getPageData: (appContext, context) => {
    return server?.server?.getPageData?.(appContext, context) || {};
  },
  handlePageRequest: (originalHandlePageRequest, context) => {
    return (
      server?.server?.handlePageRequest?.(originalHandlePageRequest, context) ||
      originalHandlePageRequest
    );
  },
  modifyHtml: async (document, context, pluginContext) => {
    await server?.server?.modifyHtml?.(document, context, pluginContext);
  }
});
