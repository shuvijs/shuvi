import { createServerPlugin } from '../../../../../server';

export default options =>
  createServerPlugin({
    test: () => options.name + 'server'
  });
