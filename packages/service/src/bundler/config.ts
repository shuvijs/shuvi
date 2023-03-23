import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from '@shuvi/toolpack/lib/webpack/config';
import { CompilerOptions } from '@shuvi/toolpack/lib/webpack/loaders/shuvi-swc-loader';
import { IPluginContext } from '../core';
import { getJavaScriptInfo } from './typescript';

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
}

export function createWebpackConfig(
  { mode, assetPublicPath, paths, config }: IPluginContext,
  { ...opts }: IWebpackConfigOptions
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
  const include = [
    paths.srcDir,
    paths.appDir,
    AppSourceRegexp,
    ...(opts.include || [])
  ];
  const { env, analyze, experimental } = config;
  const lightningCss = !!experimental.lightningCss;
  const jsConfig = getJavaScriptInfo();
  const compiler: CompilerOptions = {
    ...config.compiler,
    modularizeImports: experimental.modularizeImports,
    swcPlugins: experimental.swcPlugins,
    experimentalDecorators: Boolean(
      jsConfig?.compilerOptions?.experimentalDecorators
    ),
    emitDecoratorMetadata: Boolean(
      jsConfig?.compilerOptions?.emitDecoratorMetadata
    )
  };

  if (opts.node) {
    chain = createNodeWebpackChain({
      name,
      dev,
      projectRoot,
      outputDir,
      cacheDir,
      publicPath,
      lightningCss,
      compiler,
      jsConfig,
      include,
      env,
      analyze
    });
  } else {
    chain = createBrowserWebpackChain({
      name,
      dev,
      projectRoot,
      outputDir,
      cacheDir,
      publicPath,
      lightningCss,
      compiler,
      jsConfig,
      include,
      env,
      analyze
    });
  }

  chain.name(opts.name);
  chain.merge({
    entry: opts.entry
  });

  chain.resolve.alias.set('@shuvi/app', paths.appDir);
  chain.resolve.alias.set('@shuvi/runtime', paths.runtimeDir);
  chain.resolve.alias.set('@', paths.srcDir);

  return chain;
}
