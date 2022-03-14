import { createServerPlugin } from '@shuvi/service';
import { middleware } from './lib';

export default createServerPlugin(
  {
    addMiddleware: context => {
      return [middleware(context)];
    }
  },
  // internalMiddlewares plugin must be at the end
  { order: 10000, name: 'internal-api-middlewares' }
);
