import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';

export default createServerPlugin({
  getPageData: (appContext, context) => {
    return server?.server?.getPageData?.(appContext, context) || {};
  },
  handlePageRequest: (originalHandlePageRequest, context) => {
    if (server?.server?.handlePageRequest !== undefined) {
      console.warn(
        'Warning: handlePageRequest is an experimental feature, we recommend using api routes instead.'
      );
    }
    return (
      server?.server?.handlePageRequest?.(originalHandlePageRequest, context) ||
      originalHandlePageRequest
    );
  },
  modifyHtml: async (document, context, pluginContext) => {
    await server?.server?.modifyHtml?.(document, context, pluginContext);
  }
});
