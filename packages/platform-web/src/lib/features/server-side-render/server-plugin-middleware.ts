import { createServerPlugin } from '@shuvi/service';
import { getApiRoutesMiddleware } from '../../apiRoute';
import { getMiddlewareRoutesMiddleware } from '../../middlewareRoute';
import { getSSRMiddleware } from './lib';

export default createServerPlugin(
  {
    addMiddleware: context => {
      return [
        getApiRoutesMiddleware(context),
        getMiddlewareRoutesMiddleware(context),
        getSSRMiddleware(context)
      ];
    }
  },
  // internalMiddlewares plugin must be at the end
  { order: 10000, name: 'internalMiddlewares' }
);
