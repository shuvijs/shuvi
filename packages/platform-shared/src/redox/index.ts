import * as path from 'path';
import { createPlugin } from '@shuvi/service';
import server from './server';

const resolveLib = (module: string) =>
  path.dirname(require.resolve(path.join(module, 'package.json')));

const runtimePath = require.resolve(
  path.join(__dirname, '../../esm/redox/runtime')
);
const core = createPlugin({
  addRuntimeService: () => [
    {
      source: path.dirname(require.resolve('@shuvi/redox/package.json')),
      exported: '*',
      filepath: 'model.ts'
    }
  ],
  configWebpack: config => {
    config.resolve.alias.set('@shuvi/redox', resolveLib('@shuvi/redox'));
    return config;
  }
});
export const RedoxPlugin = {
  core,
  runtime: {
    plugin: runtimePath
  },
  server,
  types: path.join(__dirname, 'types')
};
