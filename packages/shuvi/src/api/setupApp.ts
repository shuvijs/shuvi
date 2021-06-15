import { Route, fileSnippetUtil } from '@shuvi/core';
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

  let entryContentsFile = `'${api.resolveAppFile('entryContents')}'`;

  if (config.asyncEntry === true) {
    entryContentsFile = `(${entryContentsFile})`;
  }

  api.setEntryFileContent(`import ${entryContentsFile};`);

  api.setAppModule([
    ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
    runtime.getAppModulePath()
  ]);

  api.setPluginModule([
    ...withExts(api.resolveUserFile('plugin'), moduleFileExtensions),
    require.resolve('@shuvi/utils/lib/noopFn')
  ]);

  const moduleExportProxy404 = fileSnippetUtil.moduleExportProxyCreater();
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

  const moduleExportProxyServer = fileSnippetUtil.moduleExportProxyCreater();
  api.addAppFile({
    name: 'core/server.js',
    content: () =>
      moduleExportProxyServer.getContent([
        ...withExts(api.resolveUserFile('server'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop')
      ]),
    mounted: moduleExportProxyServer.mounted,
    unmounted: moduleExportProxyServer.unmounted
  });

  const moduleExportProxyDocument = fileSnippetUtil.moduleExportProxyCreater();
  api.addAppFile({
    name: 'core/document.js',
    content: () =>
      moduleExportProxyDocument.getContent([
        ...withExts(api.resolveUserFile('document'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop')
      ]),
    mounted: moduleExportProxyDocument.mounted,
    unmounted: moduleExportProxyDocument.unmounted
  });

  if (!config.runtimeConfig || config.ssr) {
    // with ssr, we get runtimeConfig from appData
    api.addAppFile({
      name: 'core/runtimeConfig.js',
      content: () => 'export default null'
    });
  } else if (config.runtimeConfig) {
    // with none-ssr, we need create cruntimeConfig when build
    api.addAppFile({
      name: 'core/runtimeConfig.js',
      content: () =>
        `export default ${JSON.stringify(
          getPublicRuntimeConfig(config.runtimeConfig || {})
        )}`
    });
  }

  api.addAppExport(runtime.getAppModulePath(), {
    imported: 'default',
    local: 'App'
  });

  // don not use absolute path, this module would't be bundled
  api.addAppExport(
    'shuvi/lib/lib/runtimeConfig',
    '{ default as getRuntimeConfig }'
  );

  api.addAppFile({
    name: 'core/setRuntimeConfig.js',
    content: () =>
      fileSnippetUtil.moduleExport({
        'shuvi/lib/lib/runtimeConfig': {
          imported: 'setRuntimeConfig',
          local: 'default'
        }
      })
  });

  api.addAppFile({
    name: 'server.js',
    content: () =>
      fileSnippetUtil.moduleExport(
        api.config.ssr
          ? {
              [api.resolveAppFile('core', 'server')]: {
                imported: '*',
                local: 'server'
              },
              [api.resolveAppFile('core', 'document')]: {
                imported: '*',
                local: 'document'
              },
              [api.resolveAppFile('core', 'application')]: {
                imported: '*',
                local: 'application'
              },
              [runtime.getViewModulePath()]: {
                imported: 'default',
                local: 'view'
              }
            }
          : {
              [api.resolveAppFile('core', 'server')]: {
                imported: '*',
                local: 'server'
              },
              [api.resolveAppFile('core', 'document')]: {
                imported: '*',
                local: 'document'
              },
              [api.resolveAppFile('core', 'application-spa-server')]: {
                imported: '*',
                local: 'application'
              }
            }
      )
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
