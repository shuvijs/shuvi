import * as path from 'path';
import { createPluginAfter } from '@shuvi/service';
import { resolveLib, resolvePkgFile } from '../../../paths';
import { makeSureSuffix } from '@shuvi/utils/lib/platform';

const core = createPluginAfter(
  {
    addRuntimeService: () => [
      {
        source: path.dirname(
          require.resolve('@shuvi/redox-react/package.json')
        ),
        exported: '*',
        filepath: 'model.ts'
      }
    ],
    configWebpack: config => {
      config.resolve.alias.set('@shuvi/redox', resolveLib('@shuvi/redox'));
      return config;
    }
  },
  {
    name: 'model-react'
  }
);

export const ModelReactPlugin = {
  core,
  runtime: {
    // this need
    plugin: makeSureSuffix(resolvePkgFile('esm/shuvi-app/react/model/runtime'))
  }
};
