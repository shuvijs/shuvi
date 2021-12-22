import { createPlugin } from '../../../plugin';

export default (options: any) =>
  createPlugin({
    appReady: () => {
      console.log(options);
    }
  });
