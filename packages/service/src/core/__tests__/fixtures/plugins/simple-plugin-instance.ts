import { createPlugin } from '../../../plugin';

export default createPlugin({
  afterInit: () => {
    console.log('simple-plugin-instance');
  }
});
