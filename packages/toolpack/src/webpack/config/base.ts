import WebpackChain from 'webpack-chain';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import path from 'path';
import {
  ROUTE_RESOURCE_QUERYSTRING,
  PUBLIC_ENV_PREFIX
} from '@shuvi/shared/lib/constants';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { escapeRegExp } from '@shuvi/utils/lib/escapeRegExp';
import BuildManifestPlugin from '../plugins/build-manifest-plugin';
import ModuleReplacePlugin from '../plugins/module-replace-plugin';
import RequireCacheHotReloaderPlugin from '../plugins/require-cache-hot-reloader-plugin';
import { AppSourceRegexs } from '../../constants';

const dumbRouteComponent = require.resolve('../../utils/emptyComponent');

const resolveLocalLoader = (name: string) =>
  path.join(__dirname, `../loaders/${name}`);
// const resolvePlugin = (name: string) =>
//   path.join(__dirname, `../plugins/${name}`);

export interface BaseOptions {
  dev: boolean;
  projectRoot: string;
  srcDirs: string[];
  mediaFilename: string;
  buildManifestFilename: string;
  target?: string;
  publicPath?: string;
  env?: {
    [x: string]: string;
  };
}

const terserOptions: TerserPlugin.TerserPluginOptions['terserOptions'] = {
  parse: {
    ecma: 8
  },
  compress: {
    ecma: 5,
    warnings: false,
    // The following two options are known to break valid JavaScript code
    comparisons: false,
    inline: 2 // https://github.com/zeit/next.js/issues/7178#issuecomment-493048965
  },
  mangle: { safari10: true },
  output: {
    ecma: 5,
    safari10: true,
    comments: false,
    // Fixes usage of Emoji and certain Regex
    ascii_only: true
  }
};

export { WebpackChain };

export function baseWebpackChain({
  dev,
  projectRoot,
  srcDirs,
  mediaFilename,
  buildManifestFilename,
  publicPath = '/',
  env = {}
}: BaseOptions): WebpackChain {
  const { typeScriptPath, tsConfigPath, useTypeScript } = getTypeScriptInfo(
    projectRoot
  );
  const config = new WebpackChain();

  config.mode(dev ? 'development' : 'production');
  config.bail(!dev);
  config.performance.hints(false);
  config.context(projectRoot);

  config.optimization.merge({
    emitOnErrors: !dev,
    checkWasmTypes: false,
    nodeEnv: false,
    splitChunks: false,
    runtimeChunk: undefined,
    minimize: !dev
  });
  if (!dev) {
    config.optimization.minimizer('terser').use(TerserPlugin, [
      {
        extractComments: false,
        parallel: true,
        cache: true,
        sourceMap: false,
        terserOptions
      }
    ]);
  }

  config.output.merge({
    publicPath,
    hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
    hotUpdateMainFilename: 'static/webpack/[fullhash].hot-update.json',
    // This saves chunks with the name given via `import()`
    chunkFilename: `static/chunks/${
      dev ? '[name]' : '[name].[contenthash:8]'
    }.js`,
    strictModuleExceptionHandling: true,
    // crossOriginLoading: crossOrigin,
    webassemblyModuleFilename: 'static/wasm/[modulehash:8].wasm'
  });

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

  config.resolve.merge({
    modules: [
      'node_modules',
      ...nodePathList // Support for NODE_PATH environment variable
    ],
    alias: {}
  });

  config.resolveLoader.merge({
    alias: ['shuvi-babel-loader', 'route-component-loader'].reduce(
      (alias, loader) => {
        alias[`@shuvi/${loader}`] = resolveLocalLoader(loader);
        return alias;
      },
      {} as Record<string, string>
    )
  });

  config.module.set('strictExportPresence', true);
  const mainRule = config.module.rule('main');

  // TODO: FIXME: do NOT webpack 5 support with this
  // x-ref: https://github.com/webpack/webpack/issues/11467
  config.module
    .rule('webpackPatch')
    .test(/\.m?js/)
    .resolve.set('fullySpecified', false);

  mainRule
    .oneOf('js')
    .test(/\.(tsx|ts|js|mjs|jsx)$/)
    .include.merge([...srcDirs, ...AppSourceRegexs])
    .end()
    .exclude.add((path: string) => {
      if (AppSourceRegexs.some(r => r.test(path))) {
        return false;
      }
      if (srcDirs.some(src => path.includes(src))) {
        return false;
      }
      return /node_modules/.test(path);
    })
    .end()
    .use('shuvi-babel-loader')
    .loader('@shuvi/shuvi-babel-loader')
    .options({
      isNode: false,
      // webpack 5 have in-built cache.
      cacheDirectory: false
    });

  mainRule
    .oneOf('media')
    .exclude.merge([/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/])
    .end()
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options({
      name: mediaFilename
    });

  config.plugin('private/ignore-plugin').use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);

  config.plugin('define').use(webpack.DefinePlugin, [
    {
      ...Object.keys(process.env).reduce(
        (prev: { [key: string]: string }, key: string) => {
          if (key.startsWith(PUBLIC_ENV_PREFIX)) {
            prev[`process.env.${key}`] = JSON.stringify(process.env[key]);
          }
          return prev;
        },
        {}
      ),
      ...Object.keys(env).reduce((acc, key) => {
        if (/^(?:NODE_.+)|^(?:__.+)$/i.test(key)) {
          throw new Error(`The key "${key}" under "env" is not allowed.`);
        }

        return {
          ...acc,
          [`process.env.${key}`]: JSON.stringify(env[key])
        };
      }, {}),
      'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
    }
  ]);
  config
    .plugin('private/build-manifest')
    .use(BuildManifestPlugin, [
      { filename: buildManifestFilename, chunkRequest: dev }
    ]);

  if (useTypeScript) {
    config
      .plugin('private/fork-ts-checker-webpack-plugin')
      .use(require.resolve('fork-ts-checker-webpack-plugin'), [
        {
          typescript: {
            configFile: tsConfigPath,
            typeScriptPath,
            diagnosticOptions: {
              syntactic: true
            }
          },
          async: dev,
          logger: {
            infrastructure: 'silent',
            issues: 'silent',
            devServer: false
          },
          formatter: 'codeframe'
        }
      ]);
  }

  config.cache({
    type: 'memory'
  });
  if (dev) {
    // For future webpack-dev-server purpose
    config.watchOptions({
      ignored: ['**/.git/**', '**/node_modules/**']
    });
    config.set('infrastructureLogging', {
      level: 'none'
    });

    config.plugin('private/module-replace-plugin').use(ModuleReplacePlugin, [
      {
        modules: [
          {
            test: RegExp(escapeRegExp(`?${ROUTE_RESOURCE_QUERYSTRING}`)),
            module: dumbRouteComponent
          }
        ]
      }
    ]);
    // Even though require.cache is server only we have to clear assets from both compilations
    // This is because the client compilation generates the build manifest that's used on the server side
    config
      .plugin('private/require-cache-hot-reloader')
      .use(RequireCacheHotReloaderPlugin);
  } else {
    config
      .plugin('private/hashed-moduleids-plugin')
      .use(webpack.ids.HashedModuleIdsPlugin);
  }

  return config;
}
