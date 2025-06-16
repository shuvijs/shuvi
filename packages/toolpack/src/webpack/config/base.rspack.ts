import RspackChain from 'rspack-chain';
import * as path from 'path';
import * as crypto from 'crypto';
import { PUBLIC_ENV_PREFIX } from '@shuvi/shared/constants';
// Rspack 內建 DefinePlugin、IgnorePlugin、BundleAnalyzerPlugin
// 但部分插件/loader需根據 rspack 文檔調整

export interface BaseOptions {
  dev: boolean;
  name: string;
  projectRoot: string;
  outputDir: string;
  cacheDir: string;
  include: (string | RegExp)[];
  jsConfig?: {
    useTypeScript: boolean;
    typeScriptPath?: string;
    compilerOptions: any;
    resolvedBaseUrl: string;
  };
  target?: string;
  publicPath?: string;
  env?: {
    [x: string]: string | undefined;
  };
  lightningCss?: boolean;
  compiler?: any;
  analyze?: boolean;
}

export { RspackChain };

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

const getSimplifiedTargetName = (targetName: string) =>
  targetName.replace(/^shuvi\//, '');

export function baseRspackChain({
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
}: BaseOptions): RspackChain {
  const config = new RspackChain();
  config.mode(dev ? 'development' : 'production');
  config.context(projectRoot);

  config.output.path(outputDir);
  config.output.merge({
    publicPath,
    filename: `${dev ? '[name]' : '[name].[contenthash:8]'}.js`,
    chunkFilename: `static/chunks/${
      dev ? '[name]' : '[name].[contenthash:8]'
    }.js`,
    hotUpdateChunkFilename: 'static/webpack/[id].[fullhash].hot-update.js',
    hotUpdateMainFilename:
      'static/webpack/[runtime].[fullhash].hot-update.json',
    webassemblyModuleFilename: 'static/wasm/[modulehash:8].wasm',
    hashFunction: 'xxhash64',
    hashDigestLength: 16
  });

  config.optimization.merge({
    emitOnErrors: !dev,
    minimize: !dev
    // Rspack 內建 terser/css-minimizer
  });

  if (analyze && !dev) {
    const targetName = getSimplifiedTargetName(name);
    config
      .plugin('bundle-analyzer')
      .use(require('rspack-plugin-bundle-analyzer').BundleAnalyzerPlugin, [
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

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

  config.resolve.merge({
    modules: ['node_modules', ...nodePathList]
  });
  config.resolve.alias.set(
    '@swc/helpers',
    path.dirname(require.resolve(`@swc/helpers/package.json`))
  );

  // loader alias (如 lightningcss-loader, shuvi-swc-loader)
  // Rspack loader 配置方式略有不同，這裡僅設置 alias 供後續 loader 使用
  config.resolveLoader.merge({
    alias: {
      '@shuvi/lightningcss-loader': path.join(
        __dirname,
        '../loaders/lightningcss-loader'
      ),
      '@shuvi/shuvi-swc-loader': path.join(
        __dirname,
        '../loaders/shuvi-swc-loader'
      ),
      '@shuvi/empty-loader': path.join(__dirname, '../loaders/empty-loader'),
      '@shuvi/route-component-loader': path.join(
        __dirname,
        '../loaders/route-component-loader'
      )
    }
  });

  config.module.set('strictExportPresence', true);
  const mainRule = config.module.rule('main');

  config.module
    .rule('rspackPatch')
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
    .type('asset/resource')
    .set('generator', {
      filename: (pathData: { filename: string }) => {
        if (pathData.filename && isValidBase64DataURL(pathData.filename)) {
          return `static/media/base64.[hash:8][ext]`;
        } else {
          return `static/media/[name].[hash:8][ext]`;
        }
      }
    });

  config.plugin('ignore-plugin').use(require('@rspack/core').IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);

  config.plugin('private/define').use(require('@rspack/core').DefinePlugin, [
    {
      __SHUVI_DEFINE_ENV: 'true',
      ...getDefineEnv(env)
    }
  ]);

  config.plugin('define').use(require('@rspack/core').DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
    }
  ]);

  // cache config
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
      cacheDirectory: path.join(cacheDir, 'rspack', projectHash),
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

  // 路徑 alias 支持
  if (jsConfig) {
    // Rspack 目前不支持 webpack-chain 的 plugin 機制，這裡僅設置 alias
    if (jsConfig.compilerOptions && jsConfig.compilerOptions.paths) {
      const paths = jsConfig.compilerOptions.paths as Record<string, string[]>;
      Object.entries(paths).forEach(([alias, pathArr]) => {
        if (Array.isArray(pathArr) && pathArr.length > 0) {
          config.resolve.alias.set(
            alias,
            path.resolve(jsConfig.resolvedBaseUrl, pathArr[0])
          );
        }
      });
    }
  }

  if (dev) {
    config.watchOptions({
      aggregateTimeout: 5,
      ignored: ['**/.git/**']
    });
    config.set('infrastructureLogging', {
      level: 'none'
    });
    // FixWatchingPlugin 如需支持，需自行實現 Rspack 版本
  } else {
    // Rspack 內建 module id hash
  }

  return config;
}

function isValidBase64DataURL(input: string): boolean {
  if (!input.startsWith('data:')) {
    return false;
  }
  const parts = input.split(',');
  if (parts.length !== 2) {
    return false;
  }
  const metadata = parts[0];
  const data = parts[1];
  if (!metadata.includes('base64')) {
    return false;
  }
  const base64Regex = /^[A-Za-z0-9+/]+[=]{0,2}$/;
  return base64Regex.test(data);
}
