import * as path from 'path';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import { IPaths } from './apiTypes';

export async function setupTypeScript(paths: IPaths) {
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

      appTsConfig.compilerOptions.tsBuildInfoFile =
        path.relative(
          path.resolve(
            paths.rootDir,
            appTsConfig.compilerOptions.baseUrl || parsedCompilerOptions.baseUrl
          ),
          paths.catchDir
        ) + '/tsconfig.tsbuildinfo';

      // tsconfig will have the merged "include" and "exclude" by this point
      if (parsedTsConfig.exclude == null) {
        appTsConfig.exclude = ['node_modules'];
      }

      if (parsedTsConfig.include == null) {
        appTsConfig.include = ['src', '.shuvi/app/types-plugin-extended.d.ts'];
      }
    }
  });
}
