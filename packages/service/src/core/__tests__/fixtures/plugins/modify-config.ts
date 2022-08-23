import { createPlugin } from '../../../plugin';

export default createPlugin({
  afterInit: context => {
    console.log('simple-plugin-instance');
    (context as any).__plugins = [{ name: 'modify-config' }];
  }
});
