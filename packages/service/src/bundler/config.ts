import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from '@shuvi/toolpack/lib/webpack/config';
import { IPluginContext } from '../core';
import { getTypeScriptInfo } from './typescript';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import {
  CLIENT_BUILD_MANIFEST_PATH,
  SERVER_BUILD_MANIFEST_PATH,
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
  outputDir?: string;
  webpackHelpers: IWebpackHelpers;
}

export function createWebpackConfig(
  { mode, assetPublicPath, paths, config }: IPluginContext,
  { webpackHelpers, ...opts }: IWebpackConfigOptions
): WebpackChain {
  const dev = mode === 'development';
  let chain: WebpackChain;

  const name = opts.name;
  const projectRoot = paths.rootDir;
  const outputDir = opts.outputDir
    ? `${paths.buildDir}/${opts.outputDir}`
    : paths.buildDir;
  const cacheDir = paths.cacheDir;
  const publicPath = assetPublicPath;
  const env = config.env;
  const include = [paths.appDir, paths.srcDir, ...(opts.include || [])];
  const parcelCss = !!config.experimental.parcelCss;
  const experimental = config.experimental;
  const compiler = config.compiler;
  const typescript = getTypeScriptInfo();

  if (opts.node) {
    chain = createNodeWebpackChain({
      name,
      dev,
      projectRoot,
      outputDir,
      cacheDir,
      publicPath,
      parcelCss,
      experimental,
      compiler,
      typescript,
      include,
      env,
      webpackHelpers,
      buildManifestFilename: SERVER_BUILD_MANIFEST_PATH
    });
  } else {
    chain = createBrowserWebpackChain({
      name,
      dev,
      projectRoot,
      outputDir,
      cacheDir,
      publicPath,
      parcelCss,
      experimental,
      compiler,
      typescript,
      include,
      env,
      webpackHelpers,
      analyze: config.analyze,
      buildManifestFilename: CLIENT_BUILD_MANIFEST_PATH
    });
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name);
  chain.merge({
    entry: opts.entry
  });

  chain.resolve.alias.set('@shuvi/app', paths.appDir);
  chain.resolve.alias.set('@shuvi/runtime', paths.runtimeDir);
  chain.resolve.alias.set('@shuvi/user', paths.srcDir);

  return chain;
}
