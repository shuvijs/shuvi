import path from 'path';
import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { resolveLib, PACKAGE_RESOLVED } from '../paths';
import { PACKAGE_NAME } from '../constants';
import fs from 'fs';
import BuildAssetsPlugin from './plugins/build-assets-plugin';
import LoadChunkPlugin from './plugins/load-chunk-plugin';
import DomEnvPlugin from './plugins/dom-env-plugin';
import modifyStyle from './modifyStyle';

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

export function config(api: IApi) {
  let pageFiles: any[];

  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'platform-mp',
    fn: (config, { name }) => {
      if (name === BUNDLER_TARGET_SERVER) {
        config.set('entry', '@shuvi/util/lib/noop');
        return config;
      }

      if (!pageFiles) {
        pageFiles = getAllFiles(api.resolveAppFile('files', 'pages'));
      }
      const entry: Record<string, Record<string, any>> = {
        app: [api.resolveAppFile('files', 'app')]
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
      config.merge({
        entry,
        resolve: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue'],
          mainFields: ['browser', 'module', 'jsnext:main', 'main'],
          symlinks: true,
          alias: {
            // 小程序使用 regenerator-runtime@0.11
            'regenerator-runtime': resolveLib('regenerator-runtime'),
            // 开发组件库时 link 到本地调试，runtime 包需要指向本地 node_modules 顶层的 runtime，保证闭包值 Current 一致
            '@tarojs/runtime': resolveLib('@tarojs/runtime'),
            '@tarojs/shared': resolveLib('@tarojs/shared'),
            '@tarojs/taro': resolveLib('@tarojs/taro'),
            '@tarojs/api': resolveLib('@tarojs/api'),
            '@tarojs/components': '@tarojs/components/mini',
            'react-dom$': '@tarojs/react',
            [PACKAGE_NAME]: PACKAGE_RESOLVED,

            // @binance
            '@binance/mp-service': '@tarojs/taro',
            '@binance/mp-components': '@tarojs/components',
            '@binance/mp-api': '@tarojs/api',
            '@binance/http': path.resolve(
              __dirname,
              '../dist/adapters/http/index.js'
            ),
            '@binance/fetch': path.resolve(
              __dirname,
              '../dist/adapters/fetch.js'
            ),
            'i18next-browser-languagedetector': path.resolve(
              __dirname,
              '../dist/adapters/i18n/LanguageDetector/index.js'
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
      config.plugin('BuildAssetsPlugin').use(BuildAssetsPlugin);
      config.plugin('LoadChunkPlugin').use(LoadChunkPlugin);
      return config;
    }
  });
}
