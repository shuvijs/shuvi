import { createPlugin } from '@shuvi/service';
import { extendedHooks } from './hooks';
import { resolveRuntimeFile, resolveRuntimeLibFile } from '../../../utils';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
      // must be lib, because this module won't be bundled
      source: resolveRuntimeLibFile('runtimeConfig'),
      exported: '{ getRuntimeConfig }'
    },
    {
      source: resolveRuntimeFile('helper', 'getPageData'),
      exported: '{ getPageData }'
    },
    {
      source: resolveRuntimeFile('loader'),
      exported: '{ type Loader }'
    },
    {
      source: resolveRuntimeFile('runtimePublicExport'),
      exported: '*'
    }
  ]
});

export default {
  core,
  types: '@shuvi/platform-shared/esm/node/platform/plugins/main/shuvi-app'
};
