import { createPlugin } from '../../../plugin';

export default options =>
  createPlugin({
    test: () => options
  });
