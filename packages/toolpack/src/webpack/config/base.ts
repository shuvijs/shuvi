import WebpackChain from 'webpack-chain';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import webpack from 'webpack';
import * as path from 'path';
import { PUBLIC_ENV_PREFIX } from '@shuvi/shared/constants';
import FixWatchingPlugin from '../plugins/fix-watching-plugin';
import * as crypto from 'crypto';
import JsConfigPathsPlugin from '../plugins/jsconfig-paths-plugin';
import { CompilerOptions } from '../loaders/shuvi-swc-loader';

type TsCompilerOptions = import('typescript').CompilerOptions;

const resolveLocalLoader = (name: string) =>
  path.join(__dirname, `../loaders/${name}`);

export interface BaseOptions {
  dev: boolean;
  name: string;
  projectRoot: string;

  outputDir: string;
  cacheDir: string;

  // src files need to be include
  include: (string | RegExp)[];
  jsConfig?: {
    useTypeScript: boolean;
    typeScriptPath?: string;
    compilerOptions: TsCompilerOptions;
    resolvedBaseUrl: string;
  };
  target?: string;
  publicPath?: string;
  env?: {
    [x: string]: string | undefined;
  };
  lightningCss?: boolean;
  compiler?: CompilerOptions;
  analyze?: boolean;
}

const terserOptions = {
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

export function getDefineEnv(env: { [x: string]: string | undefined }) {
  return {
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
    }, {} as { [key: string]: string })
  };
}

/** remove 'shuvi/' of the target name */
const getSimplifiedTargetName = (targetName: string) =>
  targetName.replace(/^shuvi\//, '');

export function baseWebpackChain({
  dev,
  outputDir,
  lightningCss,
  compiler,
  projectRoot,
  include,
  jsConfig,
  name,
  publicPath = '/',
  env = {},
  cacheDir,
  analyze
}: BaseOptions): WebpackChain {
  const config = new WebpackChain();
  config.mode(dev ? 'development' : 'production');
  config.bail(!dev);
  config.performance.hints(false);
  config.context(projectRoot);

  config.output.path(outputDir);
  config.output.merge({
    publicPath,
    filename: `${dev ? '[name]' : '[name].[contenthash:8]'}.js`,
    // This saves chunks with the name given via `import()`
    chunkFilename: `static/chunks/${
      dev ? '[name]' : '[name].[contenthash:8]'
    }.js`,
    hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
    hotUpdateMainFilename:
      'static/webpack/[runtime].[fullhash].hot-update.json',
    strictModuleExceptionHandling: true,
    // crossOriginLoading: crossOrigin,
    webassemblyModuleFilename: 'static/wasm/[modulehash:8].wasm',
    hashFunction: 'xxhash64',
    hashDigestLength: 16
  });

  config.optimization.merge({
    emitOnErrors: !dev,
    checkWasmTypes: false,
    nodeEnv: false,
    runtimeChunk: undefined,
    minimize: !dev,
    realContentHash: false
  });

  if (dev) {
    config.optimization.usedExports(false);
  } else {
    // @ts-ignore
    config.optimization.minimizer('terser').use(TerserPlugin, [
      {
        extractComments: false,
        parallel: true,
        terserOptions
      }
    ]);
    config.optimization.minimizer('cssMinimizer').use(CssMinimizerPlugin, [
      {
        // @ts-ignore
        minify: lightningCss
          ? CssMinimizerPlugin.lightningCssMinify
          : CssMinimizerPlugin.cssnanoMinify
      }
    ]);

    if (analyze) {
      const targetName = getSimplifiedTargetName(name);
      config
        .plugin('private/bundle-analyzer-plugin')
        .use(BundleAnalyzerPlugin, [
          {
            logLevel: 'warn',
            openAnalyzer: false,
            analyzerMode: 'static',
            reportFilename: `../analyze/${targetName}.html`,
            generateStatsFile: true,
            statsFilename: `../analyze/${targetName}-stats.json`
          }
        ]);
    }
  }

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

  config.resolve.merge({
    modules: [
      'node_modules',
      ...nodePathList // Support for NODE_PATH environment variable
    ]
  });
  config.resolve.alias.set(
    '@swc/helpers',
    path.dirname(require.resolve(`@swc/helpers/package.json`))
  );

  config.resolveLoader.merge({
    alias: [
      'lightningcss-loader',
      'shuvi-swc-loader',
      'empty-loader',
      'route-component-loader'
    ].reduce((alias, loader) => {
      alias[`@shuvi/${loader}`] = resolveLocalLoader(loader);
      return alias;
    }, {} as Record<string, string>)
  });

  config.module.set('strictExportPresence', true);
  const mainRule = config.module.rule('main');

  // TODO: FIXME: await babel/babel-loader to update to fix this.
  // x-ref: https://github.com/webpack/webpack/issues/11467
  config.module
    .rule('webpackPatch')
    .test(/\.m?js/)
    .resolve.set('fullySpecified', false);

  config.module
    .rule('private/shuvi-runtime')
    .test(/\.shuvi[/\\]app[/\\]runtime[/\\]index\.(js|ts)/)
    .set('sideEffects', false);

  mainRule
    .oneOf('js')
    .test(/\.(tsx|ts|js|cjs|mjs|jsx)$/)
    .include.merge([...include])
    .end()
    .use('shuvi-swc-loader')
    .loader('@shuvi/shuvi-swc-loader')
    .options({
      isServer: false,
      compiler,
      supportedBrowsers: false,
      swcCacheDir: path.join(cacheDir, 'swc')
    });

  mainRule
    .oneOf('media')
    .exclude.merge([/\.(tsx|ts|js|cjs|mjs|jsx)$/, /\.html$/, /\.json$/])
    .end()
    // @ts-ignore
    .type('asset/resource')
    .set('generator', {
      filename: (pathData: { filename: string }) => {
        // Check if a string is a base64 data URI
        if (pathData.filename && isValidBase64DataURL(pathData.filename)) {
          // Handle base64 string case, [name] is empty
          return `static/media/base64.[hash:8][ext]`;
        } else {
          return `static/media/[name].[hash:8][ext]`;
        }
      }
    });
  // .use('file-loader')
  // .loader(require.resolve('file-loader'))
  // .options({
  //   name: 'static/media/[name].[hash:8].[ext]'
  // });

  config.plugin('private/ignore-plugin').use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);

  config.plugin('private/define').use(webpack.DefinePlugin, [
    {
      // internal field to identify the plugin config
      __SHUVI_DEFINE_ENV: 'true',
      ...getDefineEnv(env)
    }
  ]);

  config.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
    }
  ]);

  const getCacheConfig = () => {
    const projectHash = crypto
      .createHash('md5')
      .update(projectRoot)
      .digest('hex');

    const stringifiedEnvs = Object.entries({
      ...getDefineEnv(env)
    }).reduce((prev: string, [key, value]) => {
      return `${prev}|${key}=${value}`;
    }, '');

    const PACKAGE_JSON = path.resolve(__dirname, '../../../package.json');
    const SHUVI_VERSION = require(PACKAGE_JSON).version;

    return {
      cacheDirectory: path.join(cacheDir, 'webpack', projectHash),
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

  config.resolve
    .plugin('jsconfig-paths-plugin')
    .use(JsConfigPathsPlugin, [
      jsConfig?.compilerOptions.paths || {},
      jsConfig?.resolvedBaseUrl || projectRoot
    ]);

  if (dev) {
    // For webpack-dev-middleware usage
    config.watchOptions({
      aggregateTimeout: 5,
      ignored: ['**/.git/**']
    });
    config.set('infrastructureLogging', {
      level: 'none'
    });

    config.plugin('private/fix-watching-plugin').use(FixWatchingPlugin);
  } else {
    config
      .plugin('private/hashed-moduleids-plugin')
      .use(webpack.ids.HashedModuleIdsPlugin);
  }

  return config;
}

function isValidBase64DataURL(input: string): boolean {
  // Check if input starts with the data URI scheme
  if (!input.startsWith('data:')) {
    return false;
  }

  // Split the data URI into metadata and data parts
  const parts = input.split(',');
  if (parts.length !== 2) {
    return false;
  }

  const metadata = parts[0];
  const data = parts[1];

  // Check if the metadata contains 'base64'
  if (!metadata.includes('base64')) {
    return false;
  }

  // Regular expression to validate Base64 string
  const base64Regex = /^[A-Za-z0-9+/]+[=]{0,2}$/;

  // Validate Base64 data
  return base64Regex.test(data);
}
