import { createPluginAfter } from '@shuvi/service';
import { resolveLib, resolvePkgFile } from '../../../paths';

const redoxReactSource = resolveLib('@shuvi/redox-react');

const core = createPluginAfter(
  {
    addRuntimeService: () => [
      {
        source: redoxReactSource,
        exported: '*',
        filepath: 'model.ts'
      }
    ],
    configWebpack: config => {
      config.resolve.alias.set('@shuvi/redox-react', redoxReactSource);
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
    plugin: resolvePkgFile('esm/shuvi-app/react/model/runtime')
  }
};
