import { createPlugin } from '@shuvi/service';
import * as path from 'path';
import { extendedHooks } from './hooks';

const resolveFile = (...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', '..', ...paths);

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
    }
  ]
});

export const sharedPlugin = {
  core,
  types: path.join(__dirname, 'types')
};
