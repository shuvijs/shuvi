import path from 'path';
import { IApi, APIHooks } from '@shuvi/types';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { PACKAGE_DIR } from '../paths';
import webpack from 'webpack';
import fs from 'fs';
import BuildAssetsPlugin from './plugins/build-assets-plugin';
export function config(api: IApi) {
  const resolveLocal = (m: string, sub?: string) => {
    const pck = path.dirname(require.resolve(`${m}/package.json`));
    return sub ? `${pck}/${sub}` : pck;
  };
  const resolveUser = (m: string) =>
    path.join(api.paths.rootDir, 'node_modules', m);
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
  let pageFiles: any[];
  api.tap<APIHooks.IHookBundlerConfig>('bundler:configTarget', {
    name: 'platform-taro',
    fn: (config, { name }) => {
      if (name === BUNDLER_TARGET_SERVER) {
        config.clear();
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
      config.merge({
        entry,
        resolve: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue'],
          mainFields: ['browser', 'module', 'jsnext:main', 'main'],
          symlinks: true,
          alias: {
            // 小程序使用 regenerator-runtime@0.11
            'regenerator-runtime': require.resolve('regenerator-runtime'),
            // 开发组件库时 link 到本地调试，runtime 包需要指向本地 node_modules 顶层的 runtime，保证闭包值 Current 一致
            //'@tarojs/runtime': require.resolve('@tarojs/runtime')
            '@binance/mp-service': '@tarojs/taro',
            '@binance/mp-components': '@tarojs/components',
            '@tarojs/components': '@tarojs/components/mini',
            '@binance/mp-api': '@tarojs/api',
            // make sure only one version of react exsit
            '@tarojs/react': '@tarojs/react',
            'react-dom$': '@tarojs/react',
            // 'react-reconciler$': resolveModule('react-reconciler'),

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
          sideEffects: true
        }
      });

      config.plugin('provide-tarojs').use(webpack.ProvidePlugin, [
        {
          window: ['@tarojs/runtime', 'window'],
          document: ['@tarojs/runtime', 'document'],
          navigator: ['@tarojs/runtime', 'navigator'],
          requestAnimationFrame: ['@tarojs/runtime', 'requestAnimationFrame'],
          cancelAnimationFrame: ['@tarojs/runtime', 'cancelAnimationFrame'],
          Element: ['@tarojs/runtime', 'TaroElement'],
          SVGElement: ['@tarojs/runtime', 'TaroElement']
        }
      ]);
      config.plugin('BuildAssetsPlugin').use(BuildAssetsPlugin);
      config.resolve.alias.set('@shuvi/platform-react', PACKAGE_DIR);
      config.resolve.alias.set(
        '@shuvi/router-react$',
        resolveLocal('@shuvi/router-react')
      );
      config.resolve.alias.set('@shuvi/router$', resolveLocal('@shuvi/router'));
      // @ts-ignore
      config.resolve.alias.set('react$', [
        resolveUser('react'),
        resolveLocal('react')
      ]);
      // @ts-ignore
      config.resolve.alias.set('react-dom$', require.resolve('@tarojs/react'));
      return config;
    }
  });
}
