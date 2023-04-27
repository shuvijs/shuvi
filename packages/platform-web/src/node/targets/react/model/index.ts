import { createPlugin } from '@shuvi/service';
import { resolveLib, resolvePkgFile } from '../../../paths';

const reactDouraSource = resolveLib('react-doura');

const core = createPlugin(
  {
    addRuntimeService: () => [
      {
        source: reactDouraSource,
        exported: '*',
        filepath: 'model.ts'
      }
    ],
    configWebpack: config => {
      config.resolve.alias.set('react-doura', reactDouraSource);
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
