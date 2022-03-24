import { createSyncHook } from '@shuvi/hook';
import { createServerPlugin } from '../../../../../server';

const test = createSyncHook();

export default createServerPlugin({
  setup: ({ addHooks }) => {
    addHooks({ test });
  },
  test: () => {
    console.log('all-three-plugins-server');
  }
});
