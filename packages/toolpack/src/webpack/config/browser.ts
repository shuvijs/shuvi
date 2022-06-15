import * as crypto from 'crypto';
import webpack = require('webpack');
import * as path from 'path';
import WebpackChain = require('webpack-chain');
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { NAME } from '@shuvi/shared/lib/constants';
// import PreferResolverPlugin from '../plugins/prefer-resolver-plugin';
import DynamicPublicPathPlugin from '../plugins/dynamic-public-path-plugin';
import { baseWebpackChain, BaseOptions } from './base';
import { withStyle } from './parts/style';
import { IWebpackHelpers } from '../types';

const BIG_LIBRARY_THRESHOLD = 160000; // byte

export interface BrowserOptions extends BaseOptions {
  webpackHelpers: IWebpackHelpers;
  analyze?: boolean;
}

export function createBrowserWebpackChain({
  webpackHelpers,
  ...baseOptions
}: BrowserOptions): WebpackChain {
  const { dev, publicPath, analyze } = baseOptions;
  const chain = baseWebpackChain(baseOptions);
  const { useTypeScript, typeScriptPath, tsConfigPath } = getTypeScriptInfo(
    baseOptions.projectRoot
  );

  chain.target('web');
  chain.devtool(dev ? 'cheap-module-source-map' : false);
  chain.resolve.extensions.merge([
    '.mjs',
    '.js',
    ...(useTypeScript ? ['.tsx', '.ts'] : []),
    '.jsx',
    '.json',
    '.wasm'
  ]);

  if (useTypeScript) {
    chain
      .plugin('private/fork-ts-checker-webpack-plugin')
      .use(require.resolve('fork-ts-checker-webpack-plugin'), [
        {
          typescript: {
            configFile: tsConfigPath,
            mode: 'write-references',
            typeScriptPath,
            diagnosticOptions: {
              syntactic: true
            },
            configOverwrite: {
              compilerOptions: {
                incremental: true,
                tsBuildInfoFile: path.resolve(
                  baseOptions.projectRoot,
                  `.${NAME}/cache`,
                  'tsconfig.tsbuildinfo'
                )
              }
            }
          },
          async: dev,
          logger: {
            infrastructure: 'silent',
            issues: 'silent',
            devServer: false
          },
          formatter: 'codeframe'
        }
      ]);
  }
  // if (baseOptions.target) {
  //   chain.resolve
  //     .plugin('private/prefer-resolver-plugin')
  //     .use(PreferResolverPlugin, [{ suffix: baseOptions.target }]);
  // }

  if (dev) {
    chain.plugin('private/hmr-plugin').use(webpack.HotModuleReplacementPlugin);
  } else {
    chain.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        default: false,
        defaultVendors: false,
        framework: {
          chunks: 'all',
          name: 'framework',
          // This regex ignores nested copies of framework libraries so they're
          // bundled with their issuer.
          // https://github.com/zeit/next.js/pull/9012
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|@shuvi\/router|@shuvi\/router-react|scheduler|prop-types|use-sync-external-store|history)[\\/]/,
          priority: 40,
          // Don't let webpack eliminate this chunk (prevents this chunk from
          // becoming a part of the commons chunk)
          enforce: true
        },
        lib: {
          test(module: { size: Function; identifier: Function }): boolean {
            return (
              module.size() > BIG_LIBRARY_THRESHOLD &&
              /node_modules[/\\]/.test(module.identifier())
            );
          },
          name(module: {
            type: string;
            libIdent?: Function;
            updateHash: (hash: crypto.Hash) => void;
          }): string {
            const hash = crypto.createHash('sha1');
            if (module.type === `css/mini-extract`) {
              module.updateHash(hash);
            } else {
              if (!module.libIdent) {
                throw new Error(
                  `Encountered unknown module type: ${module.type}. Please open an issue.`
                );
              }

              hash.update(
                module.libIdent({ context: baseOptions.projectRoot })
              );
            }

            return hash.digest('hex').substring(0, 8);
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20
        },
        shared: {
          name(module: any, chunks: any) {
            return crypto
              .createHash('sha1')
              .update(
                chunks.reduce((acc: string, chunk: webpack.Chunk) => {
                  return acc + chunk.name;
                }, '')
              )
              .digest('hex');
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true
        }
      },
      maxInitialRequests: 25,
      minSize: 20000
    });
    if (analyze) {
      chain.plugin('private/bundle-analyzer-plugin').use(BundleAnalyzerPlugin, [
        {
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: 'static',
          reportFilename: '../analyze/client.html'
        }
      ]);
    }
  }

  chain.resolve.alias
    .set('stream', require.resolve('stream-browserify'))
    .set('path', require.resolve('path-browserify'))
    .set('crypto', require.resolve('crypto-browserify'))
    .set('buffer', require.resolve('buffer'))
    .set('vm', require.resolve('vm-browserify'));

  chain.plugin('node-buffer-polyfill').use(webpack.ProvidePlugin, [
    {
      Buffer: ['buffer', 'Buffer']
    }
  ]);

  chain.plugin('node-process-polyfill').use(webpack.ProvidePlugin, [
    {
      process: ['process']
    }
  ]);

  chain.plugin('define').tap(([options]) => [
    {
      ...options,
      __BROWSER__: true,
      // prevent errof of destructing process.env
      'process.env': JSON.stringify('{}')
    }
  ]);
  chain.plugin('dynamic-public-path-plugin').use(DynamicPublicPathPlugin);
  chain.plugin('private/build-manifest').tap(([options]) => [
    {
      ...options,
      modules: true
    }
  ]);

  return withStyle(chain, {
    extractCss: !dev,
    publicPath,
    parcelCss: baseOptions.parcelCss
  });
}
