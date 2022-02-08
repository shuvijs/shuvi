import { createPlugin } from '../../../plugin';

export default (options: any) =>
  createPlugin({
    afterInit: () => {
      console.log(options);
    }
  });
