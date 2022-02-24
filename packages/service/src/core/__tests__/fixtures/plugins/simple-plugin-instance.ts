import { createPlugin } from '../../../lifecycle';

export default createPlugin({
  afterInit: () => {
    console.log('simple-plugin-instance');
  }
});
