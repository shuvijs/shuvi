import { createPlugin } from '@shuvi/service';
import { resolvePkgFileWithoutFileProtocol } from '../../../paths';
import { extendedHooks } from './hooks';
import { makeSureSuffix } from '@shuvi/utils/lib/platform';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
      // must be export separately, we need the module path to always be the
      // same as what we've defined in
      // "packages/toolpack/src/webpack/config/parts/external.ts"
      source: makeSureSuffix(
        resolvePkgFileWithoutFileProtocol(
          'lib/shared/shuvi-singleton-runtimeConfig'
        )
      ),
      exported: '{ getRuntimeConfig }'
    },
    // todo: 不清楚爲什麽windows下需要加後綴，否則not found
    {
      source: makeSureSuffix(
        resolvePkgFileWithoutFileProtocol('esm/shuvi-app/shuvi-runtime-index')
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
