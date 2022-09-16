import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from '@shuvi/toolpack/lib/webpack/config';
import { IPluginContext } from '../core';
import { getTypeScriptInfo } from './typescript';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';

const AppSourceRegexp: RegExp = /([/\\]shuvi-app[/\\])|([/\\]\.shuvi[/\\])/;

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
  const include = [
    paths.srcDir,
    paths.appDir,
    AppSourceRegexp,
    ...(opts.include || [])
  ];
  const parcelCss = !!config.experimental.parcelCss;
  const experimental = config.experimental;
  const compiler = {
    ...config.compiler,
    modularizeImports: experimental.modularizeImports,
    swcPlugins: experimental.swcPlugins
  };
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
      compiler,
      typescript,
      include,
      env,
      webpackHelpers
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
      compiler,
      typescript,
      include,
      env,
      webpackHelpers,
      analyze: config.analyze
    });
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
