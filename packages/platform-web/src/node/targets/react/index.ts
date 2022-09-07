import { createPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { ModelReactPlugin } from './model';
import { resolvePkgFileWithoutFileProtocol } from '../../paths';

const webReactMainPlugin = createPlugin({
  addRuntimeService: () => [
    {
      source: resolvePkgFileWithoutFileProtocol(
        'esm/shuvi-app/react/shuvi-runtime-api'
      ),
      exported: '*'
    }
  ]
});
const platformWebReact = () => {
  return {
    plugins: [webReactMainPlugin, bundlerPlugin, ModelReactPlugin],
    platformModule: resolvePkgFileWithoutFileProtocol(
      'esm/shuvi-app/react/index'
    )
  };
};

export default platformWebReact;
