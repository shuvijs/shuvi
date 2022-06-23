import * as fs from 'fs';
import * as path from 'path';
import {
  createPlugin,
  IUserRouteConfig,
  IPlatformContent,
  CorePluginInstance,
  BUILD_DEFAULT_DIR
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { findFirstExistedFile, withExts } from '@shuvi/utils/lib/file';
import { rankRouteBranches } from '@shuvi/router';
import {
  getRoutesFromFiles,
  renameFilepathToComponent
} from '@shuvi/service/lib/route';
import { FileOptions } from '@shuvi/service/lib/project';
import {
  sharedPlugin,
  getPresetRuntimeFilesCreator
} from '@shuvi/platform-shared/lib/node';
import { recursiveReadDirSync } from '@shuvi/utils/lib/recursiveReaddir';
import { isEmptyObject, readConfig } from '@tarojs/helper';
import {
  UnRecursiveTemplate,
  RecursiveTemplate
} from '@tarojs/shared/dist/template';
import { PACKAGE_NAME } from '../constants';
import BuildAssetsPlugin from './webpack-plugins/build-assets-plugin';
import ModifyChunkPlugin from './webpack-plugins/modify-chunk-plugin';
import DomEnvPlugin from './webpack-plugins/dom-env-plugin';
import modifyStyle from './modify-style';
import modifySwcLoader from './modify-swc-loader';
import {
  resolveAppFile,
  resolveRouterFile,
  resolveDep,
  resolveLib,
  PACKAGE_RESOLVED
} from '../paths';
import { AppConfig, AppConfigs, IFileType } from './types';
import { IPlatformContext } from '@shuvi/service/lib/core';

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

const moduleFileExtensions = ['.js', '.jsx', '.tsx', '.ts'];

type IUserRouteHandlerWithoutChildren = Omit<IUserRouteConfig, 'children'>;
type IUserRouteHandlerOtherData = Omit<
  IUserRouteConfig,
  'children' | 'path' | 'component'
>;
export default abstract class PlatformMpBase {
  themeFilePath: string = '';
  appConfigs!: AppConfigs;
  mpPathToRoutesDone: any;
  promiseRoutes: Promise<any>;
  taroComponentsPath?: string;
  entryPath?: string;

  abstract globalObject: string;
  abstract fileType: IFileType;
  abstract template: RecursiveTemplate | UnRecursiveTemplate;

  constructor() {
    this.promiseRoutes = new Promise(resolve => {
      this.mpPathToRoutesDone = resolve;
    });
  }

  getPlatformContent(platformContext: IPlatformContext): IPlatformContent {
    const platformModule = resolveAppFile('index');
    const entry = `import "${this.entryPath || resolveAppFile('entry')}"`;
    const polyfills = [
      resolveDep('react-app-polyfill/ie11'),
      resolveDep('react-app-polyfill/stable')
    ];
    return {
      plugins: this.getPlugins() as any,
      getPresetRuntimeFiles: getPresetRuntimeFilesCreator(
        platformModule,
        entry,
        polyfills
      ),
      getMiddlewares: context => {
        const middlewaresFromPlugin = context.serverPluginRunner
          .addMiddleware()
          .flat();
        return middlewaresFromPlugin;
      }
    };
  }

  getPlugins() {
    return [
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, 'plugins', 'setup-server')
        : null,
      this.getSetupAppPlugin(),
      this.getSetupRoutesPlugin(),
      this.getConfigWebpackPlugin(),
      sharedPlugin
    ].filter(Boolean);
  }

  /**
   * setup app files
   */
  getSetupAppPlugin(): CorePluginInstance {
    return createPlugin({
      afterInit: context => {
        const appConfigFile = findFirstExistedFile([
          ...withExts(
            context.resolveUserFile('app.config'),
            moduleFileExtensions
          )
        ]);
        const appConfig: AppConfig = appConfigFile
          ? readConfig(appConfigFile)
          : {};

        if (isEmptyObject(appConfig)) {
          throw new Error('缺少 app 全局配置文件，请检查！');
        }
        this.appConfigs = {
          app: appConfig
        };

        const { themeLocation, darkmode: darkMode } = appConfig;
        if (darkMode && themeLocation && typeof themeLocation === 'string') {
          this.themeFilePath = path.resolve(
            context.paths.srcDir,
            themeLocation
          );
        }
      },
      addRuntimeService: () => [
        {
          source: resolveAppFile('Head'),
          exported: '{default as Head}'
        },
        {
          source: resolveAppFile('dynamic'),
          exported: '{default as dynamic}'
        },
        {
          source: resolveLib('@shuvi/router-react'),
          exported: '{ useParams, useRouter, useCurrentRoute, RouterView }'
        },
        {
          source: resolveLib('@shuvi/router-mp'),
          exported: '{ Link }'
        },
        {
          source: resolveRouterFile('esm', 'index'),
          exported: '*',
          filepath: 'router-mp.js'
        },
        {
          source: require.resolve(
            '@shuvi/platform-shared/lib/runtime/helper/getPageData'
          ),
          exported: '{ getPageData }'
        }
      ]
    });
  }

  getSetupRoutesPlugin(): CorePluginInstance {
    return createPlugin({
      addRuntimeFile: async ({ createFile }, context) => {
        const getFiles = (routes: IUserRouteConfig[]) => {
          const appFiles: FileOptions[] = [];

          // map url to component
          let routesMap: [string, string][] = [];
          // route other data
          let routesStore = new Map<string, IUserRouteHandlerOtherData>();
          const routesName = new Set<string>();
          // flatten routes remove children
          function flattenRoutes(
            apiRoutes: IUserRouteConfig[],
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
                  ...other,
                  path: tempPath,
                  component
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
                  if (tempMpPath.startsWith(context.paths.pagesDir)) {
                    // ensure path relate to pagesDir
                    tempMpPath = path.relative(
                      context.paths.pagesDir,
                      tempMpPath
                    );
                    // Remove the file extension from the end
                    tempMpPath = tempMpPath.replace(/\.\w+$/, '');
                  }
                  // ensure path starts with pages
                  if (!tempMpPath.startsWith('pages')) {
                    tempMpPath = path.join('pages', tempMpPath);
                  }
                  if (route.path !== tempMpPath) {
                    // generate routesMap
                    routesMap.push([route.path, path.resolve('/', tempMpPath)]);
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
          appFiles.push(
            createFile({
              name: 'routesMap.js',
              content: () => `export default ${JSON.stringify(routesMap)}`
            })
          );

          // make sure entryPagePath first postion on appPages
          const appConfig = this.appConfigs.app;
          const entryPagePath = appConfig.entryPagePath;
          if (entryPagePath && routesName.has(entryPagePath)) {
            routesName.delete(entryPagePath);
            routesName.add(entryPagePath);
          }
          const appPages = [...routesName].reverse();
          appConfig.pages = appPages;
          if (!appPages || !appPages.length) {
            throw new Error('shuvi config routes property pages config error');
          }
          for (const page of appPages) {
            const pageFile = context.resolveUserFile(`${page}`);
            const pageConfigFile = findFirstExistedFile(
              withExts(
                context.resolveUserFile(`${page}.config`),
                moduleFileExtensions
              )
            );
            const pageConfig = pageConfigFile ? readConfig(pageConfigFile) : {};
            this.appConfigs[page] = pageConfig;
            appFiles.push(
              createFile({
                name: `${page}.js`,
                content: () => `
        import * as React from 'react';
        import { createPageConfig } from '@tarojs/runtime';
        import { addGlobalRoutes, getGlobalRoutes, MpRouter } from '@shuvi/runtime/router-mp';
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
              })
            );
          }
          this.mpPathToRoutesDone();
          return appFiles; // routes file no use, remove it
        };
        let { routes } = context.config;
        if (!routes) {
          const allFiles = recursiveReadDirSync(context.paths.pagesDir, {
            rootDir: ''
          });
          routes = renameFilepathToComponent(
            getRoutesFromFiles(allFiles, context.paths.pagesDir)
          );
        }
        return getFiles(routes);
      }
    });
  }

  getConfigWebpackPlugin(): CorePluginInstance {
    return createPlugin({
      configWebpack: async (
        config,
        { name, resolveWebpackModule },
        context
      ) => {
        if (name === BUNDLER_TARGET_SERVER) return config;
        await this.promiseRoutes;
        const pageFiles = getAllFiles(context.resolveAppFile('files', 'pages'));

        const entry: Record<string, Record<string, any>> = {
          app: [context.resolveAppFile('entry')],
          comp: [resolveAppFile('template', 'comp')],
          'custom-wrapper': [resolveAppFile('template', 'custom-wrapper')]
        };

        pageFiles.forEach(page => {
          entry['pages/' + page.name] = [page.filepath];
        });
        config.entryPoints.clear();
        config.optimization.clear();
        modifyStyle(config, this.fileType.style);
        modifySwcLoader(config);
        config.output.globalObject(this.globalObject);
        config.output.chunkFilename('[name].js');
        config.output.filename('[name].js');
        const outputPath = config.output.get('path').split('/');
        if (outputPath[outputPath.length - 1] === BUILD_DEFAULT_DIR) {
          outputPath[outputPath.length - 1] = context.config.platform?.target;
          config.output.path(outputPath.join('/'));
        }
        config.plugins.delete('private/module-replace-plugin');
        config.output.publicPath('');
        config.plugins.get('define').tap(args => {
          return [
            {
              ...(args[0] || {}),
              ENABLE_INNER_HTML: true,
              ENABLE_ADJACENT_HTML: true,
              ENABLE_SIZE_APIS: false,
              ENABLE_TEMPLATE_CONTENT: true, // taro 3.3.9
              ENABLE_CLONE_NODE: true, // taro 3.3.9
              ['process.env.' +
              `${context.config.platform?.name}_${context.config.platform?.target}`.toUpperCase()]:
                context.config.platform?.target
            }
          ];
        });
        config.plugin('DomEnvPlugin').use(DomEnvPlugin, [
          {
            resolveWebpackModule
          }
        ]);
        config.plugin('BuildAssetsPlugin').use(BuildAssetsPlugin, [
          {
            appConfigs: this.appConfigs,
            themeFilePath: this.themeFilePath,
            paths: context.paths,
            fileType: this.fileType,
            template: this.template
          }
        ]);
        config.plugin('ModifyChunkPlugin').use(ModifyChunkPlugin, [
          {
            fileType: this.fileType
          }
        ]);
        const fileLoader = config.module
          .rule('main')
          .oneOfs.get('media')
          .use('file-loader');
        fileLoader.options({
          name: '[path][name].[ext]',
          esModule: false,
          useRelativePath: true,
          context: context.paths.srcDir,
          publicPath: '/'
        });

        config.merge({
          entry,
          resolve: {
            extensions: ['.tsx', '.ts', '.js', '.mjs', '.jsx'],
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
              '@tarojs/components$':
                this.taroComponentsPath || '@tarojs/components/mini',
              '@tarojs/react': resolveLib('@tarojs/react'),
              'react-dom$': resolveLib('@tarojs/react'),
              react$: resolveLib('react'),
              [PACKAGE_NAME]: PACKAGE_RESOLVED,

              // @binance
              '@binance/mp-service': '@tarojs/taro',
              '@binance/mp-components$': this.taroComponentsPath,
              '@binance/mp-api': '@tarojs/api',
              '@binance/http': path.join(
                PACKAGE_RESOLVED,
                'lib/platform-mp-base/adapters/http/index'
              ),
              '@binance/fetch': path.join(
                PACKAGE_RESOLVED,
                'lib/platform-mp-base/adapters/fetch'
              ),
              'i18next-browser-languagedetector': path.join(
                PACKAGE_RESOLVED,
                'lib/platform-mp-base/adapters/i18n/LanguageDetector/index'
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

        // https://webpack.js.org/configuration/resolve/#resolveextensions
        // Attempt to resolve these extensions in order
        function enhancedExts(extensions: string[], target: string): string[] {
          return extensions
            .map(extend => `.${target}${extend}`)
            .concat(extensions);
        }
        const extensions = config.resolve.extensions.values();
        config.resolve.extensions.clear();
        config.resolve.extensions.merge(
          enhancedExts(extensions, context.config.platform?.target!)
        );

        return config;
      }
    });
  }
}
