import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
import { extendedHooks } from './hooks';

export default createServerPlugin(
  {
    setup: ({ addHooks }) => {
      addHooks(extendedHooks);
    },
    middlewares: () => {
      return server?.server?.middlewares || [];
    }
  },
  { name: 'serverModule' }
) as ServerPluginInstance;
