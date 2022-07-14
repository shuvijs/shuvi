import { createPlugin } from '@shuvi/service';
import { resolvePkgFile } from '../../../paths';
import { extendedHooks } from './hooks';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
      // must be export separately, we need the module path to always be the
      // same as what we've defined in
      // "packages/toolpack/src/webpack/config/parts/external.ts"
      source: resolvePkgFile('lib/shared/shuvi-singleton-runtimeConfig'),
      exported: '{ getRuntimeConfig }'
    },
    {
      source: resolvePkgFile('esm/shuvi-app/shuvi-runtime-index'),
      exported: '*'
    },
    {
      source: resolvePkgFile('esm/shuvi-app/shuvi-runtime-app'),
      filepath: 'app.ts',
      exported: '*'
    }
  ]
});

export default {
  core,
  types: resolvePkgFile('lib/node/platform/plugins/main/shuvi-app.d.ts')
};
