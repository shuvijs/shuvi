import { createPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { ModelReactPlugin } from './model';
import { resolvePkgFile, resolveDep } from '../../paths';

const webReactMainPlugin = createPlugin({
  addRuntimeService: () => [
    {
      source: resolvePkgFile('esm/shuvi-app/react/shuvi-runtime-api'),
      exported: '*'
    }
  ]
});
const platformWebReact = () => {
  return {
    plugins: [webReactMainPlugin, bundlerPlugin, ModelReactPlugin],
    platformModule: resolvePkgFile('esm/shuvi-app/react/index'),
    polyfills: [
      resolveDep('react-app-polyfill/ie11'),
      resolveDep('react-app-polyfill/stable')
    ]
  };
};

export default platformWebReact;
