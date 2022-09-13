import { createPlugin } from '@shuvi/service';
import { resolvePkgFile } from '../../../paths';
import { extendedHooks } from './hooks';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
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
  core
};
