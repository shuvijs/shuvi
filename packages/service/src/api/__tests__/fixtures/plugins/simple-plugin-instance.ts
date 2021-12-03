import { createPlugin } from '../../../cliHooks';

export default createPlugin({
  appReady: () => {
    console.log('simple-plugin-instance');
  }
});
