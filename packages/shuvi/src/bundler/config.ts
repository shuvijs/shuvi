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

export interface IWebpackEntry {
  [x: string]: string | string[];
}

export interface IWebpackConfigOptions {
  name: string;
  node: boolean;
  entry: IWebpackEntry;
  outputDir: string;
}

export function createWepbackConfig(
  { mode, assetPublicPath, paths, config }: Api,
  opts: IWebpackConfigOptions
): WebpackChain {
  const dev = mode === 'development';
  let chain: WebpackChain;

  const srcDirs = [runtimeDir, paths.appDir, paths.srcDir];
  if (opts.node) {
    chain = createNodeWebpackChain({
      env: config.env,
      srcDirs,
      dev,
      projectRoot: paths.rootDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH
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
      publicPath: assetPublicPath
    });
    chain.output.path(`${paths.buildDir}/${opts.outputDir}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name);
  chain.merge({
    entry: opts.entry
  });

  chain.resolve.alias.set('@shuvi/app', paths.appDir);
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
    [BUILD_CLIENT_RUNTIME_MAIN]: [
      require.resolve('@shuvi/runtime-core/lib/index')
    ],
    [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill']
  };
}

export function getServerEntry(_api: Api): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: ['@shuvi/app/server']
  };
}
