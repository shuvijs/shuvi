import { createPlugin } from '@shuvi/service';
import { resolvePkgFileWithoutFileProtocol } from '../../../paths';
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
      source: resolvePkgFileWithoutFileProtocol(
        'lib/shared/shuvi-singleton-runtimeConfig'
      ),
      exported: '{ getRuntimeConfig }'
    },
    {
      source: resolvePkgFileWithoutFileProtocol(
        'esm/shuvi-app/shuvi-runtime-index'
      ),
      exported: '*'
    },
    {
      source: resolvePkgFileWithoutFileProtocol(
        'esm/shuvi-app/shuvi-runtime-app'
      ),
      filepath: 'app.ts',
      exported: '*'
    }
  ]
});

export default {
  core
};
