import * as rspack from '@rspack/core';
import RspackChain from 'rspack-chain';
import type { Configuration } from '@rspack/core';

type ShareConfig = Record<string, any>;

export interface ConfigOptions {
  name: string;
  entry: string;
  filename: string;
  outputDir: string;
  publicPath: string;
  shared?: ShareConfig;
  externals: Configuration['externals'];
  esmFullSpecific: Boolean;
  exposes: Record<string, string>;
}

const moduleFileExtensions = [
  '.web.mjs',
  '.mjs',
  '.web.js',
  '.js',
  '.json',
  '.web.jsx',
  '.jsx'
];

export function getRspackConfig({
  name,
  entry,
  filename,
  outputDir,
  publicPath,
  shared,
  externals,
  esmFullSpecific,
  exposes
}: ConfigOptions) {
  const config = new RspackChain();
  config.mode('development');
  config.entry('main').add(entry);
  config.devtool('cheap-module-source-map');
  config.bail(true);
  config.watch(false);
  config.set('infrastructureLogging', {
    level: 'none'
  });
  config.output.merge({
    pathinfo: false,
    path: outputDir,
    filename: filename,
    chunkFilename: '[name].js',
    publicPath,
    uniqueName: name
  });
  config.performance.hints(false);

  config.optimization.merge({
    emitOnErrors: true,
    // need to use DefinePlugin to set process.env.NODE_ENV
    nodeEnv: false,
    runtimeChunk: false,
    minimize: false,
    realContentHash: false
  });

  // Disable splitChunks to avoid chunk naming conflicts
  config.optimization.splitChunks(false);

  config.resolve.extensions.merge(moduleFileExtensions);

  // 添加 Node.js polyfills for browser environment
  config.resolve.fallback.merge({
    stream: false,
    util: false,
    buffer: false,
    process: false,
    assert: false,
    crypto: false,
    fs: false,
    path: false,
    os: false,
    http: false,
    https: false,
    zlib: false,
    url: false,
    querystring: false,
    events: false,
    tty: false,
    net: false,
    child_process: false
  });

  // config.module.set('strictExportPresence', true); // Not supported in Rspack

  // x-ref: https://github.com/webpack/webpack/issues/11467
  if (!esmFullSpecific) {
    config.module
      .rule('rspackPatch')
      .test(/\.m?js/)
      .resolve.set('fullySpecified', false);
  }

  config.module
    .rule('js')
    .test(/\.(js|mjs|cjs|jsx)$/)
    .use('esbuild-loader')
    .loader(require.resolve('esbuild-loader'))
    .options({
      loader: 'jsx', // Remove this if you're not using JSX
      target: 'es2015' // Syntax to compile to (see options below for possible values)
    });

  // Rspack cache configuration - simplified for now
  // TODO: Implement proper cache configuration when Rspack supports it
  config.cache(false);

  config.plugin('private/ignore-plugin').use(rspack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);
  config.plugin('define').use(rspack.DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify('development')
    }
  ]);

  // 使用 ModuleFederationPlugin 来暴露模块
  config
    .plugin('module-federation')
    .use(rspack.container.ModuleFederationPlugin, [
      {
        name: name,
        filename: 'remoteEntry.js',
        exposes: exposes,
        shared: {
          // 共享依赖配置
        }
      }
    ]);

  if (externals) {
    config.externals(externals);
  }

  return config;
}
