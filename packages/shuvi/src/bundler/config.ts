import path from 'path';
import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from '@shuvi/toolpack/lib/webpack/config';
import { Api } from '../api';
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_WEBPACK,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  BUILD_SERVER_FILE_SERVER
} from '../constants';
import { runtimeDir } from '../runtime';
import { IWebpackHelpers } from '@shuvi/types/src/bundler';

export interface IWebpackEntry {
  [x: string]: string | string[];
}

export interface IWebpackConfigOptions {
  name: string;
  node: boolean;
  entry: IWebpackEntry;
  srcDirs?: string[];
  outputDir: string;
  webpackHelpers: IWebpackHelpers;
}

export function createWepbackConfig(
  { mode, assetPublicPath, paths, config }: Api,
  { webpackHelpers, ...opts }: IWebpackConfigOptions
): WebpackChain {
  const dev = mode === 'development';
  let chain: WebpackChain;

  const srcDirs = [
    runtimeDir,
    paths.appDir,
    paths.srcDir,
    ...(opts.srcDirs || [])
  ];
  if (opts.node) {
    chain = createNodeWebpackChain({
      env: config.env,
      srcDirs,
      dev,
      projectRoot: paths.rootDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH,
      webpackHelpers
    });
    chain.output.path(`${paths.buildDir}/${opts.outputDir}`);
  } else {
    chain = createBrowserWebpackChain({
      env: config.env,
      srcDirs,
      dev,
      projectRoot: paths.rootDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH,
      publicPath: assetPublicPath,
      webpackHelpers
    });
    chain.output.path(`${paths.buildDir}/${opts.outputDir}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name);
  chain.merge({
    entry: opts.entry
  });

  chain.resolve.alias.set('@shuvi/app', paths.appDir);
  chain.resolve.alias.set(
    '@shuvi/runtime-core',
    path.dirname(require.resolve('@shuvi/runtime-core/package.json'))
  );
  chain.output.set('filename', ({ chunk }: { chunk: { name: string } }) => {
    // Use `[name]-[contenthash].js` in production
    if (
      !dev &&
      [
        BUILD_CLIENT_RUNTIME_MAIN,
        BUILD_CLIENT_RUNTIME_POLYFILL,
        BUILD_CLIENT_RUNTIME_WEBPACK
      ].includes(chunk.name)
    ) {
      return chunk.name.replace(/\.js$/, '-[contenthash].js');
    }

    return '[name]';
  });

  return chain;
}

export function getClientEntry(_api: Api): IWebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: ['@shuvi/app/entry'],
    [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill']
  };
}

export function getServerEntry(_api: Api): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: ['@shuvi/app/server']
  };
}
