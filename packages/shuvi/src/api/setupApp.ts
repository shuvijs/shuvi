import { Route } from '@shuvi/core';
import * as FileSnippets from '../project/file-snippets';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import path from 'path';
import { runtime } from '../runtime';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import { Api } from './api';

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}.${ext}`);
}

export async function setupApp(api: Api) {
  const { paths, config } = api;
  const ssr = api.config.ssr;

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

  api.setViewModule(runtime.getViewModulePath());

  api.setRoutesNormalizer(runtime.getRoutesNormalizerPath());

  api.setAppModule([
    ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
    runtime.getAppModulePath()
  ]);

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

  api.setPluginModule([
    ...withExts(api.resolveUserFile('plugin'), moduleFileExtensions),
    require.resolve('@shuvi/utils/lib/noopFn')
  ]);

  // todo: move into filePresets after `platform` refactoring
  // we need to move file creation logics into filePresets as much as possible
  const moduleExportProxy404 = FileSnippets.moduleExportProxyCreater();
  api.addAppFile({
    name: 'core/404.js',
    content: () =>
      moduleExportProxy404.getContent(
        [
          ...withExts(api.resolveUserFile('404'), moduleFileExtensions),
          runtime.get404ModulePath()
        ],
        true
      ),
    mounted: moduleExportProxy404.mounted,
    unmounted: moduleExportProxy404.unmounted
  });

  // with none-ssr, we need create cruntimeConfig when build
  // with ssr, we get runtimeConfig from appData
  api.setRuntimeConfigContent(
    config.runtimeConfig || !config.ssr
      ? JSON.stringify(getPublicRuntimeConfig(config.runtimeConfig || {}))
      : null
  );

  api.addAppExport(runtime.getAppModulePath(), '{ default as App }');

  // don not use absolute path, this module would't be bundled
  api.addAppExport(
    'shuvi/lib/lib/runtimeConfig',
    '{ default as getRuntimeConfig }'
  );

  // todo: move into filePresets after `platform` refactoring
  api.addAppFile({
    name: 'main.server.js',
    content: () =>
      [
        `import * as server from '${api.resolveAppFile('user', 'server')}'`,
        `import * as document from '${api.resolveAppFile('user', 'document')}'`,
        `import * as application from '${api.resolveAppFile(
          'core',
          'server',
          ssr ? 'application' : 'application-spa'
        )}'`,
        'export { server, document, application }',
        ssr &&
          `export { default as view } from '${runtime.getViewModulePath()}'
        export { default as routesNormalizer } from '${runtime.getRoutesNormalizerPath()}'`
      ]
        .filter(Boolean)
        .join(';\n')
  });

  const { routes } = api.config;
  if (Array.isArray(routes) && routes.length) {
    await api.setRoutes(routes);
  } else {
    const route = new Route(paths.pagesDir);
    if (api.mode === 'development') {
      route.subscribe(routes => {
        api.setRoutes(routes);
      });
    } else {
      const routes = await route.getRoutes();
      await api.setRoutes(routes);
    }
  }
}
