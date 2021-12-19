import { createPlugin } from '../../../plugin';

export default createPlugin({
  appReady: () => {
    console.log('simple-plugin-instance');
  }
});
