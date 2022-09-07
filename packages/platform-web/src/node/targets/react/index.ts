import { createPlugin } from '@shuvi/service';
import bundlerPlugin from './bundler';
import { ModelReactPlugin } from './model';
import { resolvePkgFileWithoutFileProtocol } from '../../paths';
import { makeSureSuffix } from '@shuvi/utils/lib/platform';

const webReactMainPlugin = createPlugin({
  addRuntimeService: () => [
    {
      source: makeSureSuffix(
        resolvePkgFileWithoutFileProtocol(
          'esm/shuvi-app/react/shuvi-runtime-api'
        )
      ),
      exported: '*'
    }
  ]
});
const platformWebReact = () => {
  return {
    plugins: [webReactMainPlugin, bundlerPlugin, ModelReactPlugin],
    platformModule: makeSureSuffix(
      resolvePkgFileWithoutFileProtocol('esm/shuvi-app/react/index')
    )
  };
};

export default platformWebReact;
