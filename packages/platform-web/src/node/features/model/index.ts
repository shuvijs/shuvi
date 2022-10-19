import { createPlugin } from '@shuvi/service';
import { resolvePkgFile, resolveLib } from '../../paths';
import server from './server';

const redoxSource = resolveLib('@shuvi/redox');

const core = createPlugin({
  addRuntimeService: () => [
    {
      source: redoxSource,
      exported: '*',
      filepath: 'model.ts'
    }
  ],
  configWebpack: config => {
    config.resolve.alias.set('@shuvi/redox', redoxSource);
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
