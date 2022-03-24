import { createPlugin } from '../../../utils';

export default options =>
  createPlugin({
    test: () => {
      console.log(options.name + 'runtime');
    }
  });
