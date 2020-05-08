import { Route, File } from '@shuvi/core';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import path from 'path';
import { runtime } from '../runtime';
import { Api } from './api';

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}.${ext}`);
}

export async function setupApp(api: Api) {
  await verifyTypeScriptSetup({
    projectDir: api.paths.rootDir,
    srcDir: api.paths.srcDir,
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
              api.paths.rootDir,
              appTsConfig.compilerOptions.baseUrl ||
                parsedCompilerOptions.baseUrl
            ),
            api.paths.appDir
          ) + '/index'
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
  const { useTypeScript } = await getTypeScriptInfo(api.paths.rootDir);
  const moduleFileExtensions = useTypeScript
    ? ['tsx', 'ts', 'js', 'jsx']
    : ['js', 'jsx', 'tsx', 'ts'];

  runtime.install(api.getPluginApi());

  api.setBootstrapModule(runtime.getBootstrapModulePath());
  api.setAppModule([
    ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
    runtime.getAppModulePath()
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
    File.moduleProxy('document.js', {
      source: [
        ...withExts(api.resolveUserFile('document'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop')
      ]
    }),
    'core'
  );
  api.addAppFile(
    File.module('utils.js', {
      exports: {
        [require.resolve(
          '@shuvi/runtime-core/lib/lib/getAppData'
        )]: 'getAppData'
      }
    }),
    'core'
  );

  api.addAppExport(runtime.getAppModulePath(), {
    imported: 'default',
    local: 'App'
  });
  api.addAppExport(runtime.getRouterModulePath(), {
    imported: 'default',
    local: 'router'
  });
  api.addAppExport(api.resolveAppFile('core', 'routes'), {
    imported: 'default',
    local: 'routes'
  });
  api.addAppExport(
    require.resolve('@shuvi/runtime-core/lib/lib/telestore'),
    'telestore'
  );

  // don not use absolute path, this mpdule would't be bundle
  api.addAppExport('shuvi/lib/lib/runtimeConfig', [
    'setRuntimeConfig',
    {
      imported: 'default',
      local: 'getRuntimeConfig'
    }
  ]);

  api.addAppFile(
    File.module('server.js', {
      exports: api.config.ssr
        ? {
            [api.resolveAppFile('core', 'document')]: {
              imported: '*',
              local: 'document'
            },
            [api.resolveAppFile('core', 'app')]: {
              imported: 'default',
              local: 'App'
            },
            [api.resolveAppFile('core', 'routes')]: {
              imported: 'default',
              local: 'routes'
            },
            [runtime.getRendererModulePath()]: {
              imported: 'default',
              local: 'renderer'
            }
          }
        : {
            [api.resolveAppFile('core', 'document')]: {
              imported: '*',
              local: 'document'
            }
          }
    })
  );

  const { routes } = api.config;
  if (Array.isArray(routes) && routes.length) {
    api.setRoutes(routes);
  } else {
    const route = new Route(api.paths.pagesDir);
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
