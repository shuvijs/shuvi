import path from 'path';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import { Api } from './api';

export async function setupApp(api: Api) {
  const { paths } = api;
  await verifyTypeScriptSetup({
    projectDir: paths.rootDir,
    srcDir: paths.srcDir,
    onTsConfig(appTsConfig, parsedTsConfig, parsedCompilerOptions) {
      if (parsedCompilerOptions.baseUrl == null) {
        appTsConfig.compilerOptions.baseUrl = './';
      }

      // resolve @shuvi/runtime to the real file
      appTsConfig.compilerOptions.paths = {
        ...parsedCompilerOptions.paths,
        '@shuvi/runtime': [
          path.relative(
            path.resolve(
              paths.rootDir,
              appTsConfig.compilerOptions.baseUrl ||
                parsedCompilerOptions.baseUrl
            ),
            paths.runtimeDir
          )
        ],
        '@shuvi/runtime/*': [
          path.relative(
            path.resolve(
              paths.rootDir,
              appTsConfig.compilerOptions.baseUrl ||
                parsedCompilerOptions.baseUrl
            ),
            paths.runtimeDir
          ) + '/*'
        ]
      };

      // tsconfig will have the merged "include" and "exclude" by this point
      if (parsedTsConfig.exclude == null) {
        appTsConfig.exclude = ['node_modules'];
      }

      if (parsedTsConfig.include == null) {
        appTsConfig.include = ['src'];
      }
    }
  });
  api.addRuntimeService('@shuvi/runtime-core', '* as Runtime');
  api.addRuntimeService(
    '@shuvi/runtime-core/lib/lifecycle',
    '{ createPlugin as createRuntimePlugin }'
  );
  api.addRuntimeService('@shuvi/router', '{ matchRoutes }');

  await api.initProjectBuilderConfigs();
}
