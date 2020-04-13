import { Route, File } from '@shuvi/core';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { runtime } from '../runtime';
import { Api } from './api';

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map((ext) => `${file}.${ext}`);
}

export async function setupApp(api: Api) {
  const { useTypeScript } = await getTypeScriptInfo(api.paths.rootDir);
  const moduleFileExtensions = useTypeScript
    ? ['tsx', 'ts', 'js', 'jsx']
    : ['js', 'jsx', 'tsx', 'ts'];

  runtime.install(api.getPluginApi());

  api.setBootstrapModule(runtime.getBootstrapModulePath());
  api.setAppModule([
    ...withExts(api.resolveUserFile('app'), moduleFileExtensions),
    runtime.getAppModulePath(),
  ]);

  api.addAppFile(
    File.moduleProxy('404.js', {
      source: [
        ...withExts(api.resolveUserFile('404'), moduleFileExtensions),
        runtime.get404ModulePath(),
      ],
      defaultExport: true,
    }),
    'core'
  );
  api.addAppFile(
    File.moduleProxy('document.js', {
      source: [
        ...withExts(api.resolveUserFile('document'), moduleFileExtensions),
        require.resolve('@shuvi/utils/lib/noop'),
      ],
    }),
    'core'
  );
  api.addAppFile(
    File.module('utils.js', {
      exports: {
        [require.resolve('@shuvi/runtime-core/lib/getAppData')]: 'getAppData',
      },
    }),
    'core'
  );

  api.addAppExport(runtime.getAppModulePath(), 'App');
  api.addAppExport(runtime.getRouterModulePath(), {
    imported: 'default',
    local: 'router',
  });
  api.addAppExport(api.resolveAppFile('core', 'routes'), {
    imported: 'default',
    local: 'routes',
  });
  api.addAppExport(require.resolve('shuvi/lib/lib/runtimeConfig'), [
    'setRuntimeConfig',
    {
      imported: 'default',
      local: 'getRuntimeConfig',
    },
  ]);

  api.addAppFile(
    File.module('server.js', {
      exports: api.config.ssr
        ? {
            [api.resolveAppFile('core', 'document')]: {
              imported: '*',
              local: 'document',
            },
            [api.resolveAppFile('core', 'app')]: {
              imported: '*',
              local: 'app',
            },
            [api.resolveAppFile('core', 'routes')]: {
              imported: 'default',
              local: 'routes',
            },
            [runtime.getRendererModulePath()]: {
              imported: 'default',
              local: 'renderer',
            },
          }
        : {
            [api.resolveAppFile('core', 'document')]: {
              imported: '*',
              local: 'document',
            },
          },
    })
  );
  const route = new Route(api.paths.pagesDir);
  if (api.mode === 'development') {
    route.subscribe((routes) => {
      api.setRoutes(routes);
    });
  } else {
    const routes = await route.getRoutes();
    api.setRoutes(routes);
  }
}
