import { createSyncHook } from '@shuvi/hook';
import { createServerPlugin } from '../../../../../server';

const test = createSyncHook();

export default options =>
  createServerPlugin({
    setup: ({ addHooks }) => {
      addHooks({ test });
    },
    test: () => {
      console.log(options.name + 'server');
    }
  });
