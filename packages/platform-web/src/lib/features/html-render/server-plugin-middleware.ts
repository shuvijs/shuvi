import { createServerPlugin } from '@shuvi/service';
import { getSSRMiddleware } from './lib';

export default createServerPlugin(
  {
    addMiddleware: context => {
      return [getSSRMiddleware(context)];
    }
  },
  // internalMiddlewares plugin must be at the end
  { order: 10000, name: 'internal-html-middleware' }
);
