import { Route, File } from '@shuvi/core';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import path from 'path';
import { runtime } from '../runtime';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import { Api } from './api';
import { APIHooks } from '@shuvi/types';

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

  const entryFileContent = await api.callHook<
    APIHooks.IHookAppEntryFileContent
  >({
    name: 'app:entryFileContent',
    initialValue: `import '${api.resolveAppFile('bootstrap')}';`
  });

  api.setEntryFileContent(entryFileContent);

  api.setAppModule([
    ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
    runtime.getAppModulePath()
  ]);

  api.setPluginModule([
    ...withExts(api.resolveUserFile('plugin'), moduleFileExtensions),
    require.resolve('@shuvi/utils/lib/noopFn')
  ]);

  api.addAppFile(
    File.moduleProxy('404.js', {
      source: [
        ...withExts(api.resolveUserFile('404'), moduleFileExtensions),
        runtime.get404ModulePath()
      ],
      defaultExport: true
    }),
    'core'
  );

  api.addAppFile(
    File.moduleProxy('server.js', {
      source: [
        ...withExts(api.resolveUserFile('server'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop')
      ]
    }),
    'core'
  );
  api.addAppFile(
    File.moduleProxy('document.js', {
      source: [
        ...withExts(api.resolveUserFile('document'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop')
      ]
    }),
    'core'
  );

  if (!config.runtimeConfig || config.ssr) {
    // with ssr, we get runtimeConfig from appData
    api.addAppFile(
      File.file('runtimeConfig.js', {
        content: `export default null`
      }),
      'core'
    );
  } else if (config.runtimeConfig) {
    // with none-ssr, we need create cruntimeConfig when build
    api.addAppFile(
      File.file('runtimeConfig.js', {
        content: `export default ${JSON.stringify(
          getPublicRuntimeConfig(config.runtimeConfig)
        )}`
      }),
      'core'
    );
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
  api.addAppFile(
    File.module('setRuntimeConfig.js', {
      exports: {
        'shuvi/lib/lib/runtimeConfig': {
          imported: 'setRuntimeConfig',
          local: 'default'
        }
      }
    }),
    'core'
  );

  api.addAppFile(
    File.module('server.js', {
      exports: api.config.ssr
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
    })
  );

  const { routes } = api.config;
  if (Array.isArray(routes) && routes.length) {
    api.setRoutes(routes);
  } else {
    const route = new Route(paths.pagesDir);
    if (api.mode === 'development') {
      route.subscribe(routes => {
        api.setRoutes(routes);
      });
    } else {
      const routes = await route.getRoutes();
      api.setRoutes(routes);
    }
  }
}
