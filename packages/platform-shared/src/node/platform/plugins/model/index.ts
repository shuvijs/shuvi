import * as path from 'path';
import { createPlugin } from '@shuvi/service';
import server from './server';
import { resolvePluginFile } from '../../../utils';

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
    plugin: resolvePluginFile('model', 'runtime')
  },
  server,
  types: path.join(__dirname, 'types')
};
