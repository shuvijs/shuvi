import path from 'path';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import type { Configuration } from 'webpack';

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

export function getConfig({
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
  const config = new WebpackChain();
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
    chunkFilename: '[name].js',
    publicPath,
    uniqueName: name
  });
  config.performance.hints(false);

  config.optimization.merge({
    emitOnErrors: true,
    checkWasmTypes: false,
    // need to use DefinePlugin to set process.env.NODE_ENV
    nodeEnv: false,
    runtimeChunk: false,
    minimize: false,
    realContentHash: false
  });

  config.optimization.splitChunks({
    chunks: 'all',
    maxInitialRequests: Infinity,
    minSize: 0,
    cacheGroups: {
      vendor: {
        test: /.+/,
        name(_module: any, _chunks: any, cacheGroupKey: string) {
          return `_${cacheGroupKey}`;
        }
      }
    }
  });

  config.resolve.extensions.merge(moduleFileExtensions);

  config.module.set('strictExportPresence', true);

  // x-ref: https://github.com/webpack/webpack/issues/11467
  if (!esmFullSpecific) {
    config.module
      .rule('webpackPatch')
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

  const DLL_VERSION = require('../../../../package.json').version;

  const stringifiedConfig = Object.entries({
    esmFullSpecific,
    shared
  }).reduce((prev: string, [key, value]) => {
    return `${prev}|${key}=${JSON.stringify(value)}`;
  }, '');

  config.cache({
    cacheDirectory: path.join(outputDir, '../cache'),
    type: 'filesystem',
    name: `dll-cache}-${config.get('mode')}`,
    version: `${DLL_VERSION}|${stringifiedConfig}`
  });

  config.plugin('private/ignore-plugin').use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }
  ]);
  config.plugin('define').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify('development')
    }
  ]);
  config.plugin('private/mf').use(webpack.container.ModuleFederationPlugin, [
    {
      library: {
        type: 'global',
        name
      },
      name,
      filename,
      exposes,
      shared
    }
  ]);

  config.externals(externals);

  return config;
}
