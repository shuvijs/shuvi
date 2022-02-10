import path from 'path';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import { getUserCustomFileCandidates } from '../project';
import { Api } from './api';

export async function setupApp(api: Api) {
  const { paths, config } = api;
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

  const getCandidates = (
    fileName: string,
    fallbackType: 'nullish' | 'noop' | 'noopFn'
  ): string[] =>
    getUserCustomFileCandidates(paths.rootDir, fileName, fallbackType);

  api.setUserModule({
    app: getCandidates('app', 'nullish'),
    error: getCandidates('error', 'nullish'),
    runtime: getCandidates('runtime', 'noop')
  });

  // set the content of @shuvi/app/entry-wrapper.js
  // entry-wrapper just import or dynamicly import `entry.js`
  let entryFile = "'@shuvi/app/entry'";

  const { pluginRunner } = api.pluginContext;

  const asyncEntry = pluginRunner.modifyAsyncEntry(config.asyncEntry);

  if (asyncEntry === true) {
    entryFile = `(${entryFile})`;
  }
  api.setEntryWrapperContent(`import ${entryFile};`);

  api.addRuntimeService('@shuvi/platform-core', '* as Runtime');

  api.addRuntimeService(
    '@shuvi/runtime-core/lib/runtimeHooks',
    '{ createPlugin as createRuntimePlugin }'
  );
  api.addRuntimeService('@shuvi/router', '{ matchRoutes }');

  await api.initProjectBuilderConfigs();
}
