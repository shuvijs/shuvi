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
      // todo: rename and limit export modules
      source: resolveFile('esm', 'runtime', 'runtimePublicExport'),
      exported: '*'
    },
    {
      source: resolveFile('esm', 'runtime', 'appProxy'),
      exported: '{ App }'
    }
  ]
});

export const sharedPlugin = {
  core,
  types: path.join(__dirname, 'types')
};
