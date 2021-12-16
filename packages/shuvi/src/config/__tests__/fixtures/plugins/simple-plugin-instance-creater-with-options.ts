import { createPlugin } from '../../../cliHooks';

export default (options: any) =>
  createPlugin({
    appReady: () => {
      console.log(options);
    }
  });
