import { createPlugin } from '../../../cliHooks';

export default createPlugin({
  appReady: () => {
    console.log('simple-plugin-instance');
  },
  config: (config, phase) => {
    (config as any)._phase = phase;
    config.publicPath = '/bar';
    return config;
  },
  legacyApi: api => {
    (api as any).__plugins = [{ name: 'modify-config' }];
  }
});
