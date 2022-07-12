import { createPlugin } from '@shuvi/service';
import { resolveToModulePath } from '../../../paths';
import './shuvi-app';
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
      source: resolveToModulePath('shared/shuvi-singleton-runtimeConfig'),
      exported: '{ getRuntimeConfig }'
    },
    {
      source: resolveToModulePath('shuvi-app/shuvi-runtime-api'),
      exported: '*'
    }
  ]
});

export default {
  core,
  types: resolveToModulePath('node/platform/plugins/main/shuvi-app')
};
