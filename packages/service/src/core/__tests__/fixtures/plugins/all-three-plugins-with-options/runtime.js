import { createPlugin } from '../../../utils';

export default options =>
  createPlugin({
    test: () => options.name + 'runtime'
  });
