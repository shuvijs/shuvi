import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';

let isWarnedhandlePageRequest: boolean = false;

export default createServerPlugin({
  getPageData: (appContext, context) => {
    return server?.server?.getPageData?.(appContext, context) || {};
  },
  handlePageRequest: (originalHandlePageRequest, context) => {
    if (
      !isWarnedhandlePageRequest &&
      server?.server?.handlePageRequest !== undefined
    ) {
      isWarnedhandlePageRequest = true;
      console.warn(
        'Warning: handlePageRequest is an experimental feature, please use with caution.'
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
