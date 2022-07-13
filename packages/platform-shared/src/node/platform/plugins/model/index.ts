import * as path from 'path';
import { createPlugin } from '@shuvi/service';
import { resolvePkgFile, resolvePluginFile } from '../../../paths';
import './shuvi-app';
import server from './server';

const resolveLib = (module: string) =>
  path.dirname(require.resolve(path.join(module, 'package.json')));

const core = createPlugin({
  addRuntimeService: () => [
    {
      source: resolveLib('@shuvi/redox'),
      exported: '*',
      filepath: 'model.ts'
    }
  ],
  configWebpack: config => {
    config.resolve.alias.set('@shuvi/redox', resolveLib('@shuvi/redox'));
    return config;
  }
});

export default {
  core,
  runtime: {
    // FIXIME: only receive a absolute path, should be able to receive a module path
    plugin: resolvePluginFile('model', 'runtime')
  },
  server,
  types: resolvePkgFile('lib/node/platform/plugins/model/shuvi-app.d.ts')
};
