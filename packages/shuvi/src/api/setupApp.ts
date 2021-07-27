import { Route } from '@shuvi/core';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import path from 'path';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import { Api } from './api';
function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}.${ext}`);
}

export async function setupApp(api: Api) {
  const { paths, config, runtimeDir } = api;
  await verifyTypeScriptSetup({
    projectDir: paths.rootDir,
    srcDir: paths.srcDir,
    onTsConfig(appTsConfig, parsedTsConfig, parsedCompilerOptions) {
      if (parsedCompilerOptions.baseUrl == null) {
        appTsConfig.compilerOptions.baseUrl = './';
      }

      // resolve @shuvi/app to the real file
      appTsConfig.compilerOptions.paths = {
        ...parsedCompilerOptions.paths,
        '@shuvi/app': [
          path.relative(
            path.resolve(
              paths.rootDir,
              appTsConfig.compilerOptions.baseUrl ||
                parsedCompilerOptions.baseUrl
            ),
            paths.appDir
          ) + '/index'
        ]
      };

      // tsconfig will have the merged "include" and "exclude" by this point
      if (parsedTsConfig.exclude == null) {
        appTsConfig.exclude = ['node_modules'];
      }

      if (parsedTsConfig.include == null) {
        appTsConfig.include = ['src', '.shuvi/app/index.d.ts'];
      }
    }
  });
  const { useTypeScript } = await getTypeScriptInfo(paths.rootDir);
  const moduleFileExtensions = useTypeScript
    ? ['tsx', 'ts', 'js', 'jsx']
    : ['js', 'jsx', 'tsx', 'ts'];

  api.setUserModule({
    app: [
      ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/nullish')
    ],
    '404': [
      ...withExts(api.resolveUserFile('404'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/nullish')
    ],
    plugin: [
      ...withExts(api.resolveUserFile('plugin'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noopFn')
    ],
    server: [
      ...withExts(api.resolveUserFile('server'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noop')
    ],
    document: [
      ...withExts(api.resolveUserFile('document'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noop')
    ]
  });

  api.setPlatformDir(runtimeDir);

  // with none-ssr, we need create cruntimeConfig when build
  // with ssr, we get runtimeConfig from appData
  api.setRuntimeConfigContent(
    config.runtimeConfig || !config.ssr
      ? JSON.stringify(getPublicRuntimeConfig(config.runtimeConfig || {}))
      : null
  );

  // don not use absolute path, this module would't be bundled
  api.addAppExport(
    'shuvi/lib/lib/runtimeConfig',
    '{ default as getRuntimeConfig }'
  );

  const { pageRoutes } = api.config;
  if (Array.isArray(pageRoutes) && pageRoutes.length) {
    await api.setPageRoutes(pageRoutes);
  } else {
    const route = new Route(paths.pagesDir);
    if (api.mode === 'development') {
      route.subscribe(routes => {
        api.setPageRoutes(routes, true);
      });
    } else {
      const routes = await route.getRoutes();
      await api.setPageRoutes(routes, true);
    }
  }
}
