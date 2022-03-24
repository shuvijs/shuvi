import { createPlugin } from '../../../../lifecycle';

export default options =>
  createPlugin({
    afterInit: () => {
      console.log(options.name + 'core');
    }
  });
