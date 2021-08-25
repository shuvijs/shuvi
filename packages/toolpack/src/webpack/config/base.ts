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
import ChunkNamePlugin from '../plugins/chunk-names-plugin';
import FixWatchingPlugin from '../plugins/fix-watching-plugin';
import RequireCacheHotReloaderPlugin from '../plugins/require-cache-hot-reloader-plugin';
import { AppSourceRegexs } from '../../constants';
import crypto from 'crypto';

const dumbRouteComponent = require.resolve('../../utils/emptyComponent');

const resolveLocalLoader = (name: string) =>
  path.join(__dirname, `../loaders/${name}`);
// const resolvePlugin = (name: string) =>
//   path.join(__dirname, `../plugins/${name}`);

export interface BaseOptions {
  dev: boolean;
  name: string;
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
    ecma: 2017 // es8 === 2017
  },
  compress: {
    ecma: 5,
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
  name,
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
    minimize: !dev,
    realContentHash: false
  });
  if (!dev) {
    config.optimization.minimizer('terser').use(TerserPlugin, [
      {
        extractComments: false,
        parallel: true,
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

  // TODO: FIXME: await babel/babel-loader to update to fix this.
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

  config.plugin('chunk-names').use(ChunkNamePlugin);
  config.plugin('private/ignore-plugin').use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);

  const shuviPublicEnv = Object.keys(process.env).reduce(
    (prev: { [key: string]: string }, key: string) => {
      if (key.startsWith(PUBLIC_ENV_PREFIX)) {
        prev[`process.env.${key}`] = JSON.stringify(process.env[key]);
      }
      return prev;
    },
    {}
  );

  const shuviConfigEnv = Object.keys(env).reduce((acc, key) => {
    if (/^(?:NODE_.+)|^(?:__.+)$/i.test(key)) {
      throw new Error(`The key "${key}" under "env" is not allowed.`);
    }

    return {
      ...acc,
      [`process.env.${key}`]: JSON.stringify(env[key])
    };
  }, {} as { [key: string]: string });

  config.plugin('define').use(webpack.DefinePlugin, [
    {
      ...shuviPublicEnv,
      ...shuviConfigEnv,
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

  const getCacheConfig = () => {
    const projectHash = crypto
      .createHash('md5')
      .update(projectRoot)
      .digest('hex');

    const stringifiedEnvs = Object.entries({
      ...shuviConfigEnv,
      ...shuviPublicEnv
    }).reduce((prev: string, [key, value]) => {
      return `${prev}|${key}=${value}`;
    }, '');

    const SHUVI_VERSION = require('shuvi/package.json').version;

    return {
      cacheDirectory: path.resolve(
        `node_modules/.cache/webpack/${projectHash}`
      ),
      type: 'filesystem',
      name: `${name.replace(/\//, '-')}-${config.get('mode')}`,
      version: `${SHUVI_VERSION}|${stringifiedEnvs}`
    };
  };

  config.cache(
    typeof process.env.SHUVI_DEV_DISABLE_CACHE !== 'undefined'
      ? false
      : getCacheConfig()
  );

  if (dev) {
    // For webpack-dev-middleware usage
    config.watchOptions({
      // timeout 300 will make hmr.test to failed, set to 350
      aggregateTimeout: 350,
      ignored: ['**/.git/**', '**/node_modules/**']
    });
    config.set('infrastructureLogging', {
      level: 'none'
    });

    config.plugin('private/fix-watching-plugin').use(FixWatchingPlugin);
    config.plugin('private/module-replace-plugin').use(ModuleReplacePlugin, [
      {
        modules: [
          {
            resourceQuery: RegExp(
              escapeRegExp(`?${ROUTE_RESOURCE_QUERYSTRING}`)
            ),
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

    config.optimization.usedExports(false);
  } else {
    config
      .plugin('private/hashed-moduleids-plugin')
      .use(webpack.ids.HashedModuleIdsPlugin);
  }

  return config;
}
