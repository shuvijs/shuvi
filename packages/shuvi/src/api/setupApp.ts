import path from 'path';
import { APIHooks } from '@shuvi/types';

import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { enhancedExts } from '@shuvi/shared/lib/enhancedExts';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import { renameFilepathToComponent } from '../lib/routes';
import { renameFilepathToModule } from '../lib/apiRoutes';
import { Route } from '../route';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import resolveRuntimeCoreFile from '../lib/resolveRuntimeCoreFile';
import { Api } from './api';

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}${ext}`);
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

  let moduleFileExtensions = useTypeScript
    ? ['.tsx', '.ts', '.js', '.jsx']
    : ['.js', '.jsx', '.tsx', '.ts'];

  moduleFileExtensions = enhancedExts(
    moduleFileExtensions,
    config.platform?.target!
  );

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

  // set the content of @shuvi/app/entry.client.js
  api.addEntryCode('import "@shuvi/app/core/client/entry"');

  // set the content of @shuvi/app/entry.client-wrapper.js
  // entry.client-wrapper just import or dynamicly import `entry.client.js`
  let entryFile = "'@shuvi/app/entry.client'";
  if (config.asyncEntry === true) {
    entryFile = `(${entryFile})`;
  }
  api.setEntryWrapperContent(`import ${entryFile};`);

  // with none-ssr, we need create cruntimeConfig when build
  // with ssr, we get runtimeConfig from appData
  api.setRuntimeConfigContent(
    config.runtimeConfig || !config.ssr
      ? JSON.stringify(getPublicRuntimeConfig(config.runtimeConfig || {}))
      : null
  );

  api.addAppExport(
    resolveRuntimeCoreFile('helper/getPageData'),
    '{ getPageData }'
  );
  // don not use absolute path, this module would't be bundled
  api.addAppExport(
    'shuvi/lib/lib/runtimeConfig',
    '{ default as getRuntimeConfig }'
  );

  await setupRoutes(api);
  await api.callHook<APIHooks.IHookBeforeProjectBuild>(
    'projectBuilder:beforeBuild'
  );
}

async function setupRoutes(api: Api) {
  const {
    paths,
    config: { apiRoutes, routes }
  } = api;
  if (Array.isArray(routes)) {
    await api.setRoutes(routes);
  } else {
    const route = new Route(paths.pagesDir, false);
    if (api.mode === 'development') {
      route.subscribe(tempRoutes => {
        api.setRoutes(renameFilepathToComponent(tempRoutes));
      });
    } else {
      const tempRoutes = await route.getRoutes();
      await api.setRoutes(renameFilepathToComponent(tempRoutes));
    }
  }
  if (Array.isArray(apiRoutes) && apiRoutes.length) {
    await api.setApiRoutes(apiRoutes);
  } else {
    const apiRoute = new Route(paths.apisDir, true);
    if (api.mode === 'development') {
      apiRoute.subscribe(tempApiRoutes => {
        api.setApiRoutes(renameFilepathToModule(tempApiRoutes));
      });
    } else {
      const tempApiRoutes = await apiRoute.getRoutes();
      await api.setApiRoutes(renameFilepathToModule(tempApiRoutes));
    }
  }
}
