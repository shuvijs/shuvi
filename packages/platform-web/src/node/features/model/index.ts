import { createPlugin } from '@shuvi/service';
import { resolvePkgFile, resolveLib } from '../../paths';
import server from './server';

const douraSource = resolveLib('doura');

const core = createPlugin({
  addRuntimeService: () => [
    {
      source: douraSource,
      exported: '*',
      filepath: 'model.ts'
    }
  ],
  configWebpack: config => {
    config.resolve.alias.set('doura', douraSource);
    return config;
  }
});

export default {
  core,
  runtime: {
    plugin: resolvePkgFile('lib/node/features/model/runtime.js')
  },
  server,
  types: resolvePkgFile('lib/node/features/model/shuvi-app.d.ts')
};
