import { createServerPlugin } from '@shuvi/service';
import resources from '@shuvi/service/lib/resources';

let isWarnedhandlePageRequest: boolean = false;

export default createServerPlugin({
  getPageData: (appContext, context) => {
    return resources.server?.server?.getPageData?.(appContext, context) || {};
  },
  handlePageRequest: (originalHandlePageRequest, context) => {
    if (
      !isWarnedhandlePageRequest &&
      resources.server?.server?.handlePageRequest !== undefined
    ) {
      isWarnedhandlePageRequest = true;
      console.warn(
        'Warning: handlePageRequest is an experimental feature, please use with caution.'
      );
    }
    return (
      resources.server?.server?.handlePageRequest?.(
        originalHandlePageRequest,
        context
      ) || originalHandlePageRequest
    );
  },
  modifyHtml: async (document, context, pluginContext) => {
    await resources.server?.server?.modifyHtml?.(
      document,
      context,
      pluginContext
    );
  }
});
