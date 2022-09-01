import * as crypto from 'crypto';
import webpack from 'webpack';
import * as path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { resolve } from '@shuvi/utils/lib/resolve';
import { CommonChunkFilename } from '../../constants';
import { IWebpackHelpers } from '../types';
import { WebpackChain, baseWebpackChain, BaseOptions } from './base';
import { withStyle } from './parts/style';
import { splitChunksFilter } from './parts/helpers';

const BIG_LIBRARY_THRESHOLD = 160000; // byte
const SHUVI_PKGS_REGEX = /[\\/]node_modules[\\/]@shuvi[\\/]/;
const FRAMEWORK_REACT_MODULES: {
  test: RegExp;
  issuers?: RegExp[];
}[] = [
  {
    test: /[/\\]node_modules[/\\]react[/\\]/
  },
  {
    test: /[/\\]node_modules[/\\]react-dom[/\\]/
  },
  {
    test: /[/\\]node_modules[/\\]scheduler[/\\]/,
    issuers: [/[/\\]node_modules[/\\]react-dom[/\\]/]
  }
];

export interface BrowserOptions extends BaseOptions {
  webpackHelpers: IWebpackHelpers;
  analyze?: boolean;
}

export function createBrowserWebpackChain(
  options: BrowserOptions
): WebpackChain {
  const { cacheDir, typescript, dev, publicPath, analyze } = options;
  const chain = baseWebpackChain(options);
  const useTypeScript = !!typescript?.useTypeScript;

  chain.target('web');
  chain.devtool(dev ? 'cheap-module-source-map' : false);
  chain.resolve.extensions.merge([
    ...(useTypeScript ? ['.ts', '.tsx'] : []),
    '.mjs',
    '.js',
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
            configFile: typescript.tsConfigPath,
            mode: 'write-references',
            typeScriptPath: typescript.typeScriptPath,
            diagnosticOptions: {
              syntactic: true
            },
            configOverwrite: {
              compilerOptions: {
                incremental: true,
                tsBuildInfoFile: path.resolve(cacheDir, 'tsbuildinfo')
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

  if (dev) {
    chain.plugin('private/hmr-plugin').use(webpack.HotModuleReplacementPlugin);
  } else {
    chain.optimization.splitChunks({
      chunks: splitChunksFilter,
      cacheGroups: {
        default: false,
        defaultVendors: false,
        framework: {
          chunks: 'all',
          name: 'framework',
          filename: CommonChunkFilename,
          test(
            module: webpack.Module,
            { moduleGraph }: { moduleGraph: webpack.ModuleGraph }
          ) {
            const resource: string | null = module.nameForCondition();
            if (!resource) {
              return false;
            }

            if (SHUVI_PKGS_REGEX.test(resource)) {
              return true;
            }

            return FRAMEWORK_REACT_MODULES.some(frameworkModule => {
              if (!frameworkModule.test.test(resource)) {
                return false;
              }

              // Check issuer to ignore nested copies of framework libraries so they're
              // bundled with their issuer.
              // https://github.com/zeit/next.js/pull/9012
              if (frameworkModule.issuers) {
                for (const issuerTest of frameworkModule.issuers) {
                  // fix:  DeprecationWarning: Module.issuer: Use new ModuleGraph API
                  const issuer = moduleGraph.getIssuer(module);
                  const issuerResource = issuer
                    ? issuer.nameForCondition()
                    : null;
                  if (!issuerResource || !issuerTest.test(issuerResource)) {
                    return false;
                  }
                }
              }

              return true;
            });
          },
          // test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|@shuvi[\\/]router|@shuvi[\\/]router-react|scheduler|prop-types|use-sync-external-store|history)[\\/]/,
          priority: 40,
          // Don't let webpack eliminate this chunk (prevents this chunk from
          // becoming a part of the commons chunk)
          enforce: true
        },
        lib: {
          test(module: {
            size: Function;
            nameForCondition: Function;
          }): boolean {
            return (
              module.size() > BIG_LIBRARY_THRESHOLD &&
              /[/\\]node_modules[/\\]/.test(module.nameForCondition() || '')
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

              hash.update(module.libIdent({ context: options.projectRoot }));
            }

            return hash.digest('hex').substring(0, 8);
          },
          filename: CommonChunkFilename,
          priority: 30,
          minChunks: 1,
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

  // node polyfills
  chain.resolve.set('fallback', {
    buffer: resolve('buffer', {
      includeCoreModules: false
    }),
    crypto: require.resolve('crypto-browserify'),
    path: require.resolve('path-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify')
  });

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
  // chain.plugin('dynamic-public-path-plugin').use(DynamicPublicPathPlugin);
  chain.plugin('private/build-manifest').tap(([options]) => [
    {
      ...options,
      modules: true
    }
  ]);

  return withStyle(chain, {
    extractCss: !dev,
    publicPath,
    parcelCss: options.parcelCss,
    filename: 'static/css/[contenthash:8].css',
    chunkFilename: 'static/css/[contenthash:8].chunk.css'
  });
}
