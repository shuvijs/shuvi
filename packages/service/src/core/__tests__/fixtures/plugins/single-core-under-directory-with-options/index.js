import { createPlugin } from '../../../../plugin';

export default options =>
  createPlugin({
    afterInit: () => {
      console.log(options);
    }
  });
