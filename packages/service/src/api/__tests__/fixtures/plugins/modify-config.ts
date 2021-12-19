import { createPlugin } from '../../../plugin';

export default createPlugin({
  appReady: () => {
    console.log('simple-plugin-instance');
  },
  config: (config, phase) => {
    (config as any)._phase = phase;
    config.publicPath = '/bar';
    return config;
  },
  setup: context => {
    (context as any).__plugins = [{ name: 'modify-config' }];
  }
});
