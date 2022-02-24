import { createPlugin } from '../../../lifecycle';

export default (options: any) =>
  createPlugin({
    afterInit: () => {
      console.log(options);
    }
  });
