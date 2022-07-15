import { createServerPlugin } from '@shuvi/service';
import { extendedHooks } from './serverHooks';

export default createServerPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  }
});
