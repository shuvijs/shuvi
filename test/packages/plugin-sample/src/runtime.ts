import { createRuntimePlugin } from '@shuvi/platform-shared/shared';

export default (option: string) =>
  createRuntimePlugin({
    init: () => {
      console.warn(option + 'runtime');
    }
  });
