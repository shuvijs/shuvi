import { createPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { RedoxReactPlugin } from './redox-react';
import { resolveToModulePath, resolveDep } from '../../paths';

const webReactMainPlugin = createPlugin({
  addRuntimeService: () => [
    {
      source: resolveToModulePath('shuvi-app/react/shuvi-runtime-api'),
      exported: '*'
    }
  ]
});
const platformWebReact = () => {
  return {
    plugins: [webReactMainPlugin, bundlerPlugin, RedoxReactPlugin],
    platformModule: resolveToModulePath('shuvi-app/react/index'),
    polyfills: [
      resolveDep('react-app-polyfill/ie11'),
      resolveDep('react-app-polyfill/stable')
    ]
  };
};

export default platformWebReact;
