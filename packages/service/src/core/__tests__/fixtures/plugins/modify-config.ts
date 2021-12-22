import { createPlugin } from '../../../plugin';

export default createPlugin({
  config: (config, phase) => {
    (config as any)._phase = phase;
    config.publicPath = '/bar';
    return config;
  },
  appReady: () => {
    console.log('simple-plugin-instance');
  },
  setup: context => {
    (context as any).__plugins = [{ name: 'modify-config' }];
  }
});
