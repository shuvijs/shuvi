import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { extendedHooks } from '../hooks';

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
  handlePageRequest: (originalHandlePageRequest, context) => {
    return (
      server?.server?.handlePageRequest?.(originalHandlePageRequest, context) ||
      originalHandlePageRequest
    );
  }
});
