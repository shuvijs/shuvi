import path from 'path';
import { IRuntimeConfig } from '@shuvi/platform-core';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { verifyTypeScriptSetup } from '@shuvi/toolpack/lib/utils/verifyTypeScriptSetup';
import resolveRuntimeCoreFile from '../../lib/resolveRuntimeCoreFile';
import {
  ProjectBuilder,
  UserModule,
  TargetModule,
  fileSnippets
} from '../../project';
import { getPaths, resolvePath } from '../paths';
import { PluginRunner } from '../plugin';
import { NormalizedShuviServerConfig } from '../shuviServerTypes';

export interface Options {
  builder: ProjectBuilder;
  rootDir: string;
  config: NormalizedShuviServerConfig;
  runner: PluginRunner;
}

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}${ext}`);
}

function getPublicRuntimeConfig(runtimeConfig: IRuntimeConfig): IRuntimeConfig {
  const keys = Object.keys(runtimeConfig);
  const res: IRuntimeConfig = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key.startsWith('$')) continue;

    res[key] = runtimeConfig[key];
  }
  return res;
}

export async function generateAppSourceFiles({
  builder,
  rootDir,
  config,
  runner
}: Options) {
  const paths = getPaths({
    rootDir,
    outputPath: config.publicDir,
    publicDir: config.publicDir
  });
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

  builder.setUserModule({
    app: [
      ...withExts(resolvePath(paths.srcDir, 'app'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/nullish')
    ],
    error: [
      ...withExts(resolvePath(paths.srcDir, 'error'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/nullish')
    ],
    runtime: [
      ...withExts(resolvePath(paths.srcDir, 'runtime'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noop')
    ],
    server: [
      ...withExts(resolvePath(paths.srcDir, 'server'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noop')
    ],
    document: [
      ...withExts(resolvePath(paths.srcDir, 'document'), moduleFileExtensions),
      require.resolve('@shuvi/utils/lib/noop')
    ]
  });

  // set the content of @shuvi/app/entry.client.js
  builder.addEntryCode('import "@shuvi/app/core/client/entry"');

  // set the content of @shuvi/app/entry.client-wrapper.js
  // entry.client-wrapper just import or dynamicly import `entry.client.js`
  let entryFile = "'@shuvi/app/entry.client'";
  if (config.asyncEntry === true) {
    entryFile = `(${entryFile})`;
  }
  builder.setEntryWrapperContent(`import ${entryFile};`);

  // with none-ssr, we need create cruntimeConfig when build
  // with ssr, we get runtimeConfig from appData
  builder.setRuntimeConfigContent(
    config.runtimeConfig || !config.ssr
      ? JSON.stringify(getPublicRuntimeConfig(config.runtimeConfig || {}))
      : null
  );
  builder.addExport('@shuvi/platform-core', '* as Runtime');
  builder.addExport(
    '@shuvi/runtime-core/lib/runtimeHooks',
    '{ createPlugin as createRuntimePlugin }'
  );
  builder.addExport('@shuvi/router', '{ matchRoutes }');
  builder.addExport(
    resolveRuntimeCoreFile('helper/getPageData'),
    '{ getPageData }'
  );
  // don not use absolute path, this module would't be bundled
  builder.addExport(
    '@shuvi/service/lib/lib/runtimeConfig',
    '{ default as getRuntimeConfig }'
  );

  const [
    polyfills,
    files,
    exports,
    entryCodes,
    services,
    runtimePlugins,
    platformModule,
    clientModule,
    userModule
  ] = await Promise.all([
    runner.appPolyfill().then(a => a.flat()),
    runner.appFile(fileSnippets).then(a => a.flat()),
    runner.appExport().then(a => a.flat()),
    runner.appEntryCode().then(a => a.flat()),
    runner.appService().then(a => a.flat()),
    runner.runtimePlugin().then(a =>
      a.flat().map(item => {
        if (typeof item === 'string') {
          return {
            plugin: item
          };
        }
        return item;
      })
    ),
    runner.platformModule() as string,
    runner.clientModule() as TargetModule,
    runner.userModule() as UserModule
  ]);

  builder.addRuntimePlugin(...runtimePlugins);

  polyfills.forEach(file => {
    builder.addPolyfill(file);
  });

  files.forEach(file => {
    builder.addFile(file);
  });

  exports.forEach(({ source, exported }) => {
    builder.addExport(source, exported);
  });

  entryCodes.forEach(content => {
    builder.addEntryCode(content);
  });

  services.forEach(({ source, exported, filepath }) => {
    builder.addService(source, exported, filepath);
  });

  builder.setPlatformModule(platformModule);
  builder.setClientModule(clientModule);
  builder.setUserModule(userModule);

  return builder;
}
