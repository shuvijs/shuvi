import { createPlugin } from '@shuvi/service';
import { extendedHooks } from './hooks';

export default createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addServerPlugin: () => [
    require.resolve('./server-plugin-custom-server'),
    require.resolve('./server-plugin-middleware')
  ]
});
