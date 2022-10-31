import { createServerPlugin } from '@shuvi/service';
import resources from '@shuvi/service/lib/resources';
import logger from '@shuvi/utils/lib/logger';

let isWarnedhandlePageRequest: boolean = false;

export default createServerPlugin({
  getPageData: appContext => {
    return resources.server?.server?.getPageData?.(appContext) || {};
  },
  handlePageRequest: originalHandlePageRequest => {
    if (
      !isWarnedhandlePageRequest &&
      resources.server?.server?.handlePageRequest !== undefined
    ) {
      isWarnedhandlePageRequest = true;
      logger.warn(
        'Warning: handlePageRequest is an experimental feature, please use with caution.'
      );
    }
    return (
      resources.server?.server?.handlePageRequest?.(
        originalHandlePageRequest
      ) || originalHandlePageRequest
    );
  },
  modifyHtml: async (document, context) => {
    await resources.server?.server?.modifyHtml?.(document, context);
  },
  sendHtml: async originalSendHtml => {
    return (
      resources.server.server?.sendHtml?.(originalSendHtml) || originalSendHtml
    );
  }
});
