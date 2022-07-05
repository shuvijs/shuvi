import { createPlugin } from '@shuvi/service';
import * as path from 'path';
import { extendedHooks } from './hooks';

const resolveFile = (...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', '..', ...paths);

const resolveLib = (module: string) =>
  path.dirname(require.resolve(path.join(module, 'package.json')));

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
      // must be lib, because this module won't be bundled
      source: resolveFile('lib', 'runtime', 'runtimeConfig'),
      exported: '{ getRuntimeConfig }'
    },
    {
      source: resolveFile('esm', 'runtime', 'helper', 'getPageData'),
      exported: '{ getPageData }'
    },
    {
      source: resolveFile('esm', 'runtime', 'loader'),
      exported: '{ type Loader }'
    },
    {
      source: resolveFile('esm', 'runtime', 'runtimePublicExport'),
      exported: '*'
    },
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

export const sharedPlugin = {
  core,
  types: path.join(__dirname, 'types')
};
