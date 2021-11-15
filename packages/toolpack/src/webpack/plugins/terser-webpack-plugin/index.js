// @ts-nocheck
import * as path from 'path';
import webpack, { ModuleFilenameHelpers, sources } from 'webpack';
import pLimit from 'p-limit';
import { Worker } from 'jest-worker';

function getEcmaVersion(environment) {
  // ES 6th
  if (
    environment.arrowFunction ||
    environment.const ||
    environment.destructuring ||
    environment.forOf ||
    environment.module
  ) {
    return 2015;
  }

  // ES 11th
  if (environment.bigIntLiteral || environment.dynamicImport) {
    return 2020;
  }

  return 5;
}

function buildError(error, file) {
  if (error.line) {
    return new Error(
      `${file} from Terser\n${error.message} [${file}:${error.line},${
        error.col
      }]${
        error.stack ? `\n${error.stack.split('\n').slice(1).join('\n')}` : ''
      }`
    );
  }

  if (error.stack) {
    return new Error(`${file} from Terser\n${error.message}\n${error.stack}`);
  }

  return new Error(`${file} from Terser\n${error.message}`);
}

export class TerserPlugin {
  constructor(options = {}) {
    const { cacheDir, terserOptions = {}, parallel, swcMinify } = options;

    this.options = {
      swcMinify,
      cacheDir,
      parallel,
      terserOptions
    };
  }

  async optimize(
    compiler,
    compilation,
    assets,
    optimizeOptions,
    cache,
    { SourceMapSource, RawSource }
  ) {
    let webpackAsset = '';
    let hasMiddleware = false;
    let numberOfAssetsForMinify = 0;
    const assetsList = Object.keys(assets);

    const assetsForMinify = await Promise.all(
      assetsList
        .filter(name => {
          if (
            !ModuleFilenameHelpers.matchObject.bind(
              // eslint-disable-next-line no-undefined
              undefined,
              { test: /\.[cm]?js(\?.*)?$/i }
            )(name)
          ) {
            return false;
          }

          const res = compilation.getAsset(name);
          if (!res) {
            console.log(name);
            return false;
          }

          // remove below if we start minifying middleware chunks
          if (name.startsWith('static/chunks/webpack-')) {
            webpackAsset = name;
          }

          // don't minify _middleware as it can break in some cases
          // and doesn't provide too much of a benefit as it's server-side
          if (name.match(/(middleware-chunks|_middleware\.js$)/)) {
            hasMiddleware = true;
          }

          const { info } = res;

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return false;
          }

          return true;
        })
        .map(async name => {
          const { info, source } = compilation.getAsset(name);

          const eTag = cache.getLazyHashedEtag(source);
          const output = await cache.getPromise(name, eTag);

          if (!output) {
            numberOfAssetsForMinify += 1;
          }

          return { name, info, inputSource: source, output, eTag };
        })
    );

    if (hasMiddleware && webpackAsset) {
      // emit a separate version of the webpack
      // runtime for the middleware
      const asset = compilation.getAsset(webpackAsset);
      compilation.emitAsset(
        webpackAsset.replace('webpack-', 'webpack-middleware-'),
        asset.source,
        {}
      );
    }

    const numberOfWorkers = Math.min(
      numberOfAssetsForMinify,
      optimizeOptions.availableNumberOfCores
    );

    let initializedWorker;

    // eslint-disable-next-line consistent-return
    const getWorker = () => {
      if (this.options.swcMinify) {
        return {
          minify: async options => {
            const result = await require('../../../utils/load-sources').minify(
              options.input,
              {
                ...(options.inputSourceMap
                  ? {
                      sourceMap: {
                        content: JSON.stringify(options.inputSourceMap)
                      }
                    }
                  : {}),
                compress: true,
                mangle: true
              }
            );

            return result;
          }
        };
      }

      if (initializedWorker) {
        return initializedWorker;
      }

      initializedWorker = new Worker(path.join(__dirname, './minify.js'), {
        numWorkers: numberOfWorkers,
        enableWorkerThreads: true
      });

      initializedWorker.getStdout().pipe(process.stdout);
      initializedWorker.getStderr().pipe(process.stderr);

      return initializedWorker;
    };

    const limit = pLimit(
      // When using the SWC minifier the limit will be handled by Node.js
      this.options.swcMinify
        ? Infinity
        : numberOfAssetsForMinify > 0
        ? numberOfWorkers
        : Infinity
    );
    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(
        limit(
          (() => {
            const { name, inputSource, info, eTag } = asset;
            let { output } = asset;

            return async () => {
              if (!output) {
                const { source: sourceFromInputSource, map: inputSourceMap } =
                  inputSource.sourceAndMap();

                const input = Buffer.isBuffer(sourceFromInputSource)
                  ? sourceFromInputSource.toString()
                  : sourceFromInputSource;

                const options = {
                  name,
                  input,
                  inputSourceMap,
                  terserOptions: { ...this.options.terserOptions }
                };

                if (typeof options.terserOptions.module === 'undefined') {
                  if (typeof info.javascriptModule !== 'undefined') {
                    options.terserOptions.module = info.javascriptModule;
                  } else if (/\.mjs(\?.*)?$/i.test(name)) {
                    options.terserOptions.module = true;
                  } else if (/\.cjs(\?.*)?$/i.test(name)) {
                    options.terserOptions.module = false;
                  }
                }

                try {
                  output = await getWorker().minify(options);
                } catch (error) {
                  compilation.errors.push(buildError(error, name));

                  return;
                }

                if (output.map) {
                  output.source = new SourceMapSource(
                    output.code,
                    name,
                    output.map,
                    input,
                    /** @type {SourceMapRawSourceMap} */ (inputSourceMap),
                    true
                  );
                } else {
                  output.source = new RawSource(output.code);
                }

                await cache.storePromise(name, eTag, {
                  source: output.source
                });
              }

              /** @type {AssetInfo} */
              const newInfo = { minimized: true };
              const { source } = output;

              compilation.updateAsset(name, source, newInfo);
            };
          })()
        )
      );
    }

    await Promise.all(scheduledTasks);

    if (initializedWorker) {
      await initializedWorker.end();
    }
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    const { SourceMapSource, RawSource } =
      compiler?.webpack?.sources || sources;
    const { output } = compiler.options;

    if (typeof this.options.terserOptions.ecma === 'undefined') {
      this.options.terserOptions.ecma = getEcmaVersion(
        output.environment || {}
      );
    }

    const pluginName = this.constructor.name;
    const availableNumberOfCores = this.options.parallel;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const cache = compilation.getCache('TerserWebpackPlugin');

      const handleHashForChunk = (hash, chunk) => {
        // increment 'c' to invalidate cache
        hash.update('c');
      };

      const JSModulesHooks =
        webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        );
      JSModulesHooks.chunkHash.tap(pluginName, (chunk, hash) => {
        if (!chunk.hasRuntime()) return;
        return handleHashForChunk(hash, chunk);
      });

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE
        },
        async assets =>
          await this.optimize(
            compiler,
            compilation,
            assets,
            {
              availableNumberOfCores
            },
            cache,
            { SourceMapSource, RawSource }
          )
      );
    });
  }
}
