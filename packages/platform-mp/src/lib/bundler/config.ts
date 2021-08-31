import path from 'path';
import { IApi, APIHooks, Runtime } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { rankRouteBranches } from '@shuvi/router';
import { PACKAGE_NAME } from '../constants';
import fs from 'fs';
import BuildAssetsPlugin from './plugins/build-assets-plugin';
import LoadChunkPlugin from './plugins/load-chunk-plugin';
import DomEnvPlugin from './plugins/dom-env-plugin';
import modifyStyle from './modifyStyle';
import {
  resolveAppFile,
  resolveRouterFile,
  resolveDep,
  resolveLib,
  PACKAGE_RESOLVED
} from '../paths';
import { isEmptyObject, readConfig } from '@tarojs/helper';
import { AppConfig as TaroAppConfig, Config } from '@tarojs/taro';
const EXT_REGEXP = /\.[a-zA-Z]+$/;

const getAllFiles = (
  dirPath: string,
  parent: string = '',
  fileList: any[] = []
): any[] => {
  const files = fs.readdirSync(dirPath);
  let currentFileList: any[] = fileList;
  files.forEach((file: string) => {
    const filepath = path.join(dirPath, file);
    const name = path.join(parent, file.replace(EXT_REGEXP, ''));
    if (fs.statSync(filepath).isDirectory()) {
      currentFileList = getAllFiles(filepath, name, currentFileList);
      // Match *.ts (source) or *.js (compiled) file, but ignore *.d.ts file
    } else if (/\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file)) {
      currentFileList.push({
        name,
        filepath
      });
    }
  });
  return currentFileList;
};

const moduleFileExtensions = ['js', 'jsx', 'tsx', 'ts'];
function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}.${ext}`);
}

export interface AppConfig extends TaroAppConfig {
  entryPagePath?: string;
  darkMode: boolean;
}

export interface PageConfigs {
  [name: string]: Config;
}

export function installPlatform(api: IApi) {
  const appConfigFile = api.helpers.fileSnippets.findFirstExistedFile([
    ...withExts(api.resolveUserFile('app.config'), moduleFileExtensions)
  ]);
  const appConfig: AppConfig = appConfigFile ? readConfig(appConfigFile) : {};

  if (isEmptyObject(appConfig)) {
    throw new Error('缺少 app 全局配置文件，请检查！');
  }

  let appPages: string[] = [];
  const pageConfigs: PageConfigs = {};

  const { themeLocation, darkmode: darkMode } = appConfig;
  let themeFilePath: string = '';
  if (darkMode && themeLocation && typeof themeLocation === 'string') {
    themeFilePath = path.resolve(api.paths.srcDir, themeLocation);
  }

  api.setPlatformModule(resolveAppFile('index'));
  // IE11 polyfill: https://github.com/facebook/create-react-app/blob/c38aecf73f8581db4a61288268be3a56b12e8af6/packages/react-app-polyfill/README.md#polyfilling-other-language-features
  api.addAppPolyfill(resolveDep('react-app-polyfill/ie11'));
  api.addAppPolyfill(resolveDep('react-app-polyfill/stable'));
  api.addAppExport(resolveAppFile('App'), '{ default as App }');
  // api.addAppExport(resolveAppFile('head/head'), '{default as Head}');
  // api.addAppExport(resolveAppFile('dynamic'), '{default as dynamic}');
  api.addAppExport(
    resolveLib('@shuvi/router-react'),
    '{ useParams, useRouter, useCurrentRoute, RouterView, withRouter }'
  );
  api.addEntryCode(`require('${PACKAGE_NAME}/lib/runtime')`);

  api.addAppService(resolveRouterFile('lib', 'index'), '*', 'router-mp.js');

  let pageFiles: any[];

  let mpPathToRoutesDone: any;
  const PromiseRoutes: Promise<any> = new Promise(resolve => {
    mpPathToRoutesDone = resolve;
  });
  // this hooks works before webpack bundler
  // orders can make sure appConfig.page and pageConfigs has correctly value
  api.tap<APIHooks.IHookAppRoutes>('app:routes', {
    name: 'mpPathToRoutes',
    fn: async routes => {
      type IUserRouteHandlerWithoutChildren = Omit<
        Runtime.IUserRouteConfig,
        'children'
      >;
      type IUserRouteHandlerOtherData = Omit<
        Runtime.IUserRouteConfig,
        'children' | 'path' | 'component'
      >;
      // map url to component
      let routesMap: [string, string][] = [];
      // route other data
      let routesStore = new Map<string, IUserRouteHandlerOtherData>();
      const routesName = new Set<string>();
      // flatten routes remove children
      function flattenRoutes(
        apiRoutes: Runtime.IUserRouteConfig[],
        branches: IUserRouteHandlerWithoutChildren[] = [],
        parentPath = ''
      ): IUserRouteHandlerWithoutChildren[] {
        apiRoutes.forEach(route => {
          const { children, component, ...other } = route;
          let tempPath = path.join(parentPath, route.path);

          if (children) {
            flattenRoutes(children, branches, tempPath);
          }
          if (component) {
            branches.push({
              path: tempPath,
              component,
              ...other
            });
          }
        });
        return branches;
      }

      function removeConfigPathAddMpPath(
        routes: IUserRouteHandlerWithoutChildren[]
      ) {
        for (let i = routes.length - 1; i >= 0; i--) {
          const route = routes[i];
          const { component, path: routePath, ...other } = route;
          if (component) {
            // remove config path, eg: miniprogram/src/pages/index/index.config.js
            if (/.*\.config\.\w+$/.test(component)) {
              routes.splice(i, 1);
            } else {
              let tempMpPath = component;
              if (tempMpPath.startsWith(api.paths.pagesDir)) {
                // ensure path relate to pagesDir
                tempMpPath = path.relative(api.paths.pagesDir, tempMpPath);
                // Remove the file extension from the end
                tempMpPath = tempMpPath.replace(/\.\w+$/, '');
              }
              // ensure path starts with pages
              if (!tempMpPath.startsWith('pages')) {
                tempMpPath = path.join('pages', tempMpPath);
              }
              if (route.path !== tempMpPath) {
                // generate routesMap
                routesMap.push([route.path, tempMpPath]);
                route.path = tempMpPath;
              }
              routesName.add(route.path);
              routesStore.set(route.path, other);
            }
          }
        }
      }
      routes = flattenRoutes(routes);
      removeConfigPathAddMpPath(routes);
      let rankRoutes = routesMap.map(r => [r[0], r] as [string, typeof r]);
      rankRoutes = rankRouteBranches(rankRoutes);
      routesMap = rankRoutes.map(apiRoute => apiRoute[1]);
      await api.addAppFile({
        name: 'routesMap.js',
        content: () => `export default ${JSON.stringify(routesMap)}`
      });

      // make sure entryPagePath first position on appPages
      const entryPagePath = appConfig.entryPagePath;
      if (entryPagePath && routesName.has(entryPagePath)) {
        routesName.delete(entryPagePath);
        routesName.add(entryPagePath);
      }
      appPages = [...routesName].reverse();
      appConfig.pages = appPages;
      if (!appPages || !appPages.length) {
        throw new Error('shuvi config routes property pages config error');
      }
      for (const page of appPages) {
        const pageFile = api.resolveUserFile(`${page}`);
        const pageConfigFile = api.helpers.fileSnippets.findFirstExistedFile(
          withExts(api.resolveUserFile(`${page}.config`), moduleFileExtensions)
        );
        const pageConfig = pageConfigFile ? readConfig(pageConfigFile) : {};
        pageConfigs[page] = pageConfig;
        await api.addAppFile({
          name: `${page}.js`,
          content: () => `
        import * as React from 'react';
        import { createPageConfig } from '@tarojs/runtime';
        import { addGlobalRoutes, getGlobalRoutes, MpRouter } from '@shuvi/services/router-mp';
        import pageComponent from '${pageFile}';
        const pageConfig = ${JSON.stringify(pageConfig)};
        const pageName = '${page}';
        addGlobalRoutes(pageName, pageComponent, ${JSON.stringify(
          routesStore.get(page) || {}
        )});
        function MpRouterWrapper(){
          return (
            <MpRouter
              initialEntries={['/' + pageName]}
              routes={getGlobalRoutes()}
            >
            </MpRouter>
          )
        };
        const component = MpRouterWrapper;
        const inst = Page(createPageConfig(component, pageName, {root:{cn:[]}}, pageConfig || {}))
        `
        });
      }
      mpPathToRoutesDone();
      return []; // routes file no use, remove it
    }
  });

  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'platform-mp',
    fn: async (config, { name }) => {
      await PromiseRoutes;
      if (name === BUNDLER_TARGET_SERVER) {
        config.set('entry', '@shuvi/util/lib/noop');
        return config;
      }
      if (!pageFiles) {
        pageFiles = getAllFiles(api.resolveAppFile('files', 'pages'));
      }
      const entry: Record<string, Record<string, any>> = {
        app: [api.resolveAppFile('entry.client')]
      };
      pageFiles.forEach(page => {
        entry['pages/' + page.name] = [page.filepath];
      });
      config.entryPoints.clear();
      config.optimization.clear();
      modifyStyle(config, 'bxss');
      config.output.chunkFilename(
        `${
          process.env.NODE_ENV === 'development'
            ? '[name]'
            : '[name].[contenthash:8]'
        }.js`
      );
      config.plugins.delete('private/module-replace-plugin');
      config.merge({
        entry,
        resolve: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue'],
          mainFields: ['jsnext:main', 'browser', 'module', 'main'],
          symlinks: true,
          alias: {
            // 小程序使用 regenerator-runtime@0.11
            'regenerator-runtime': resolveLib('regenerator-runtime'),
            // 开发组件库时 link 到本地调试，runtime 包需要指向本地 node_modules 顶层的 runtime，保证闭包值 Current 一致
            '@tarojs/runtime': resolveLib('@tarojs/runtime'),
            '@tarojs/shared': resolveLib('@tarojs/shared'),
            '@tarojs/taro': resolveLib('@tarojs/taro'),
            '@tarojs/api': resolveLib('@tarojs/api'),
            '@tarojs/components$': require.resolve(
              '@shuvi/platform-mp/lib/runtime/components-react'
            ),
            '@tarojs/react': resolveLib('@tarojs/react'),
            'react-dom$': resolveLib('@tarojs/react'),
            react$: resolveLib('react'),
            'react-reconciler$': resolveLib('react-reconciler'),
            [PACKAGE_NAME]: PACKAGE_RESOLVED,

            // @binance
            '@binance/mp-service': '@tarojs/taro',
            '@binance/mp-components$': require.resolve(
              '@shuvi/platform-mp/lib/runtime/components-react'
            ),
            '@binance/mp-api': '@tarojs/api',
            '@binance/http': path.join(
              PACKAGE_RESOLVED,
              'lib/bundler/adapters/http/index'
            ),
            '@binance/fetch': path.join(
              PACKAGE_RESOLVED,
              'lib/bundler/adapters/fetch'
            ),
            'i18next-browser-languagedetector': path.join(
              PACKAGE_RESOLVED,
              'lib/bundler/adapters/i18n/LanguageDetector/index'
            )
          }
        },
        resolveLoader: {
          modules: ['node_modules']
        },
        optimization: {
          sideEffects: true,
          runtimeChunk: {
            name: 'runtime'
          },
          splitChunks: {
            maxInitialRequests: Infinity,
            minSize: 0,
            usedExports: true,
            automaticNameDelimiter: '.',
            cacheGroups: {
              common: {
                name: 'common',
                chunks: 'all',
                minChunks: 2,
                priority: 1
              },
              vendors: {
                name: 'vendors',
                chunks: 'all',
                minChunks: 2,
                test: (module: any) =>
                  /[\\/]node_modules[\\/]/.test(module.resource),
                priority: 10
              },
              taro: {
                name: 'taro',
                chunks: 'all',
                test: (module: any) =>
                  /@tarojs[\\/][a-z]+/.test(module.context),
                priority: 100
              }
            }
          }
        }
      });

      config.plugin('DomEnvPlugin').use(DomEnvPlugin);
      config.plugin('BuildAssetsPlugin').use(BuildAssetsPlugin, [
        {
          appConfig,
          pageConfigs,
          themeFilePath,
          paths: api.paths
        }
      ]);
      config.plugin('LoadChunkPlugin').use(LoadChunkPlugin);
      const fileLoader = config.module
        .rule('main')
        .oneOfs.get('media')
        .use('file-loader');
      fileLoader.options({
        name: '[path][name].[ext]',
        useRelativePath: true,
        context: api.paths.srcDir,
        publicPath: '/'
        //outputPath: '/sdsdsds/'
      });
      return config;
    }
  });
}
