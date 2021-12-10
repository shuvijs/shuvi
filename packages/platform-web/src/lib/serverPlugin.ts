import { createServerPlugin } from '@shuvi/service';
import { getApiRoutesMiddleware } from './apiRoute';
import { getMiddlewareRoutesMiddleware } from './middlewareRoute';
import { getSSRMiddleware } from './SSR';

export default createServerPlugin({
  serverMiddlewareLast: context => {
    return [
      getApiRoutesMiddleware(context),
      getMiddlewareRoutesMiddleware(context),
      getSSRMiddleware(context)
    ];
  }
});
