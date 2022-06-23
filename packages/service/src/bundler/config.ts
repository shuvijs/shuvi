import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from '@shuvi/toolpack/lib/webpack/config';
import { IPluginContext } from '../core';
import { getTypeScriptInfo } from './typescript';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_WEBPACK
} from '../constants';

export interface IWebpackEntry {
  [x: string]: string | string[];
}

export interface IWebpackConfigOptions {
  name: string;
  node: boolean;
  entry: IWebpackEntry;
  include?: string[];
  outputDir: string;
  webpackHelpers: IWebpackHelpers;
}

export function createWebpackConfig(
  { mode, assetPublicPath, paths, config }: IPluginContext,
  { webpackHelpers, ...opts }: IWebpackConfigOptions
): WebpackChain {
  const dev = mode === 'development';
  let chain: WebpackChain;

  const parcelCss = !!config.experimental.parcelCss;

  const include = [paths.appDir, paths.srcDir, ...(opts.include || [])];
  const typescript = getTypeScriptInfo();
  if (opts.node) {
    chain = createNodeWebpackChain({
      buildManifestFilename: BUILD_MANIFEST_PATH,
      dev,
      parcelCss,
      typescript,
      env: config.env,
      mediaFilename: BUILD_MEDIA_PATH,
      name: opts.name,
      projectRoot: paths.rootDir,
      include,
      publicPath: assetPublicPath,
      webpackHelpers
    });
    chain.output.path(`${paths.buildDir}/${opts.outputDir}`);
  } else {
    chain = createBrowserWebpackChain({
      analyze: config.analyze,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      dev,
      typescript,
      parcelCss,
      env: config.env,
      mediaFilename: BUILD_MEDIA_PATH,
      name: opts.name,
      projectRoot: paths.rootDir,
      include,
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
  chain.resolve.alias.set('@shuvi/runtime', paths.runtimeDir);
  chain.resolve.alias.set('@shuvi/user', paths.srcDir);
  chain.output.set('filename', ({ chunk }: { chunk: { name: string } }) => {
    // Use `[name]-[contenthash].js` in production
    if (!dev) {
      return `[name]-[contenthash].js`;
    }

    return '[name].js';
  });

  return chain;
}
