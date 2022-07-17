import { createPlugin } from '@shuvi/service';

const core = createPlugin({
  extendConfig: config => {
    if (config.router?.history === 'auto') {
      config.router.history = 'browser';
    }
    return {
      ...config,
      ssr: true
    };
  }
});

export default {
  core
};
