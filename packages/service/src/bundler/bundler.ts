import path from 'path';
import { createEvent, RemoveListenerCallback } from '@shuvi/utils/lib/events';
import ForkTsCheckerWebpackPlugin, {
  Issue,
  createCodeFrameFormatter
} from '@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import logger from '@shuvi/utils/lib/logger';
import { inspect } from 'util';
import {
  webpack,
  WebpackChain,
  DynamicDll,
  MultiCompiler as WebapckMultiCompiler,
  Compiler as WebapckCompiler,
  resolveWebpackModule
} from '@shuvi/toolpack/lib/webpack';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { BUNDLER_TARGET_CLIENT } from '@shuvi/shared/lib/constants';
import { Server, ShuviRequestHandler } from '../server';
import { IPluginContext } from '../core';
import { isFatalError } from '../error';
import { Target, TargetChain } from '../core/plugin';
import { createWebpackConfig, IWebpackConfigOptions } from './config';
import { runCompiler, BundlerResult } from './runCompiler';
import { CLIENT_OUTPUT_DIR } from '../constants';
import { setupTypeScript } from './typescript';
import { WatchingProxy, Watching } from './watchingProxy';

export type CompilerErr = {
  message: string;
  moduleName?: string;
  file?: string;
  loc?: string;
};

export interface NormalizedBundlerOptions {
  preBundle: boolean;
  ignoreTypeScriptErrors: boolean;
}

export type BundlerOptions = Partial<NormalizedBundlerOptions>;

const defaultBundleOptions: NormalizedBundlerOptions = {
  preBundle: false,
  ignoreTypeScriptErrors: false
};

const hasEntry = (chain: WebpackChain) => chain.entryPoints.values().length > 0;

export interface Bundler {
  targets: Target[];
  watching: Watching;
  watch(): Watching;
  build(): Promise<BundlerResult>;
  onBuildDone(cb: FinishedCallback): RemoveListenerCallback;
  onTypeCheckingDone(cb: FinishedCallback): RemoveListenerCallback;
  applyDevMiddlewares(server: Server): void;

  getSubCompiler(name: string): WebapckCompiler | undefined;
  resolveTargetConfig(): Promise<Target[]>;
}

export interface CompilerStats {
  errors: CompilerErr[];
  warnings: CompilerErr[];
}

export type FinishedCallback = (stats: CompilerStats) => any;

export interface BundlerEvent {
  'build-done': (stats: CompilerStats) => void;
  'ts-error': (err: CompilerErr) => void;
  'ts-warnings': (warnings: CompilerErr[]) => void;
}

class WebpackBundler implements Bundler {
  private _cliContext: IPluginContext;
  private _compiler!: WebapckMultiCompiler;
  private _options: NormalizedBundlerOptions;
  private _targets: Target[] = [];
  private _buildEvent = createEvent<FinishedCallback>();
  private _typecheckingEvent = createEvent<FinishedCallback>();
  private _finishedNum = 0;
  private _watching: WatchingProxy = new WatchingProxy();
  private _devMiddlewares: ShuviRequestHandler[] = [];
  private _inited: boolean = false;
  private _startTime: number | null = null;
  private _isCompiling: boolean | null = false;

  constructor(options: NormalizedBundlerOptions, cliContext: IPluginContext) {
    this._options = options;
    this._cliContext = cliContext;
  }

  async init() {
    if (this._inited) {
      return;
    }

    let dynamicDll: DynamicDll | undefined;
    if (this._options.preBundle) {
      dynamicDll = new DynamicDll({
        cacheDir: path.join(this._cliContext.paths.cacheDir, 'dll'),
        rootDir: this._cliContext.paths.rootDir,
        exclude: [/react-refresh/],
        resolveWebpackModule(module) {
          return resolveWebpackModule(module);
        }
      });
      this._devMiddlewares.push(dynamicDll.middleware);
    }
    this._compiler = await this._getWebpackCompiler(dynamicDll);

    this._inited = true;
  }

  get watching(): Watching {
    return this._watching;
  }

  getSubCompiler(name: string): WebapckCompiler | undefined {
    if (!this._compiler) {
      return;
    }

    return this._compiler.compilers.find(compiler => compiler.name === name);
  }

  onBuildDone(cb: FinishedCallback) {
    return this._buildEvent.on(cb);
  }

  onTypeCheckingDone(cb: FinishedCallback) {
    return this._typecheckingEvent.on(cb);
  }

  applyDevMiddlewares(server: Server) {
    this._devMiddlewares.forEach(m => server.use(m));
  }

  watch(): Watching {
    if (this._watching.watched) {
      return this._watching;
    }

    this._targets.forEach(({ name }) => {
      if (name === BUNDLER_TARGET_CLIENT) {
        this._setupListenersForTarget(name, {
          typeChecking: true
        });
      } else {
        this._setupListenersForTarget(name, {
          typeChecking: false
        });
      }
    });

    const webpackWatching = this._compiler.watch(
      this._compiler.compilers.map(
        childCompiler => childCompiler.options.watchOptions || {}
      ),
      () => {
        // do nothing
      }
    );
    this._watching.set(webpackWatching);

    return this._watching;
  }

  async build(): Promise<BundlerResult> {
    const compiler = this._compiler;

    if (this._options.ignoreTypeScriptErrors) {
      logger.info('Skipping validation of types');
      this._compiler.compilers.forEach(compiler => {
        ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).issues.tap(
          'afterTypeScriptCheck',
          (issues: Issue[]) => issues.filter(msg => msg.severity !== 'error')
        );
      });
    }

    return runCompiler(compiler);
  }

  public async resolveTargetConfig(): Promise<Target[]> {
    return await this._getTargets();
  }

  public get targets() {
    return this._targets;
  }

  private async _getWebpackCompiler(
    dynamicDll?: DynamicDll | null
  ): Promise<WebapckMultiCompiler> {
    if (!this._compiler) {
      this._targets = await this._getTargets();
      if (dynamicDll) {
        this._compiler = webpack(
          this._targets.map(({ config }) => {
            if (config.target === 'node') {
              return config;
            }
            return dynamicDll.modifyWebpack(config);
          })
        );
      } else {
        this._compiler = webpack(this._targets.map(t => t.config));
      }

      let isFirstSuccessfulCompile = true;

      this._compiler.hooks.done.tap('done', async stats => {
        const warnings: webpack.StatsError[] = [];
        const errors: webpack.StatsError[] = [];
        this._isCompiling = false;
        let timeMessage = '';

        if (this._startTime) {
          const time = performance.now() - this._startTime;
          this._startTime = 0;

          timeMessage =
            time > 2000
              ? ` in ${Math.round(time / 100) / 10}s`
              : ` in ${Math.ceil(time)} ms`;
        }

        stats.stats.forEach(s => {
          const statsData = s.toJson({
            all: false,
            warnings: true,
            errors: true
          });
          warnings.push(...(statsData.warnings || []));
          errors.push(...(statsData.errors || []));
        });

        const isSuccessful = !warnings.length && !errors.length;
        if (isSuccessful) {
          if (!isFirstSuccessfulCompile) {
            logger.info(
              `Compiled client and server successfully${timeMessage}`
            );
          }
          setImmediate(first => {
            // make sure this event is fired after all bundler:target-done
            this._cliContext.pluginRunner.afterBundlerDone({ first, stats });
          }, isFirstSuccessfulCompile);
          isFirstSuccessfulCompile = false;
        }
        //reset the startTime
        this._startTime = null;
      });

      this._compiler.hooks.invalid.tap('invalid', () => {
        if (!this._isCompiling) {
          this._isCompiling = true;
          logger.info('Compiling client and server...');
        }
      });
    }

    return this._compiler!;
  }

  private _tryResolveOnFinish(_name: string, stats: CompilerStats) {
    if (this._targets.length === ++this._finishedNum) {
      this._finishedNum = 0;
      this._buildEvent.emit(stats);
    }
  }

  private _createConfig(options: IWebpackConfigOptions) {
    return createWebpackConfig(this._cliContext, options);
  }

  private _setupListenersForTarget(
    name: string,
    options: { typeChecking: boolean }
  ) {
    const compiler = this.getSubCompiler(name)!;
    let isFirstSuccessfulCompile = true;
    let tsMessagesPromise: Promise<CompilerStats> | undefined;
    let tsMessagesResolver: (diagnostics: CompilerStats) => void;
    let isInvalid = true;

    const _error = (...args: string[]) => logger.error(`[${name}]`, ...args);
    const _warn = (...args: string[]) => logger.warn(`[${name}]`, ...args);
    compiler.hooks.invalid.tap(`invalid`, () => {
      tsMessagesPromise = undefined;
      isInvalid = true;
    });

    const useTypeScript = !!compiler.options.plugins?.find(
      plugin => plugin instanceof ForkTsCheckerWebpackPlugin
    );
    if (options.typeChecking && useTypeScript) {
      const typescriptFormatter = createCodeFrameFormatter({});

      compiler.hooks.beforeCompile.tap('beforeCompile', () => {
        tsMessagesPromise = new Promise(resolve => {
          tsMessagesResolver = msgs => resolve(msgs);
        });
      });

      ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).issues.tap(
        'afterTypeScriptCheck',
        (issues: Issue[]) => {
          const format = (message: any) => {
            const file = (message.file || '').replace(/\\/g, '/');
            const formatted = typescriptFormatter(message);
            return {
              message: formatted,
              moduleName: file
            };
          };
          tsMessagesResolver({
            errors: issues.filter(msg => msg.severity === 'error').map(format),
            warnings: issues
              .filter(msg => msg.severity === 'warning')
              .map(format)
          });
          return issues;
        }
      );
    }

    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
      if (this._startTime === null) {
        this._startTime = performance.now();
      }
    });
    // "done" event fires when Webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.hooks.done.tap('done', async stats => {
      // if done is triggered without a preceding invalid event, just ignore it
      // no real compile occurs in this situation
      if (!isInvalid) {
        return;
      }
      isInvalid = false;

      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      // We only construct the warnings and errors for speed:
      // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true
      });

      const messages = formatWebpackMessages(statsData);
      const isSuccessful =
        !messages.errors?.length && !messages.warnings?.length;
      if (isSuccessful) {
        await this._cliContext.pluginRunner.afterBundlerTargetDone({
          first: isFirstSuccessfulCompile,
          name: compiler.name!,
          stats
        });
        isFirstSuccessfulCompile = false;
      }

      const hasErrors = messages.errors.length > 0;
      const hasWarnings = messages.warnings.length > 0;
      // If errors exist, only show errors.
      if (hasErrors) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        messages.errors = messages.errors.slice(0, 1);
        _error('Failed to compile.\n');
        _error(messages.errors.join('\n\n'));
      }

      // Show warnings if no errors were found.
      if (!hasErrors && hasWarnings) {
        _warn('Compiled with warnings.\n');
        _warn(messages.warnings.join('\n\n'));
      }

      this._tryResolveOnFinish(name, {
        errors: statsData.errors ? statsData.errors.slice(0, 1) : [],
        warnings: statsData.warnings ? statsData.warnings.slice(0, 1) : []
      });

      const typePromise = tsMessagesPromise;
      if (options.typeChecking && useTypeScript && !hasErrors) {
        const messages = await tsMessagesPromise;
        if (typePromise !== tsMessagesPromise) {
          // a new compilation started so we don't care about this
          return;
        }

        if (messages) {
          this._typecheckingEvent.emit({
            errors: messages.errors ? messages.errors.slice(0, 1) : [],
            warnings: messages.warnings ? messages.warnings.slice(0, 1) : []
          });
        } else {
          this._typecheckingEvent.emit({
            errors: [],
            warnings: []
          });
        }
      }
    });
  }

  private _initDefaultBuildTarget(): TargetChain[] {
    const defaultWebpackHelpers = webpackHelpers();
    const defaultChain = createWebpackConfig(this._cliContext, {
      name: BUNDLER_TARGET_CLIENT,
      node: false,
      entry: {},
      outputDir: CLIENT_OUTPUT_DIR,
      webpackHelpers: defaultWebpackHelpers
    });
    return [
      {
        chain: defaultChain,
        name: BUNDLER_TARGET_CLIENT
      }
    ];
  }

  private async _getTargets(): Promise<Target[]> {
    const targets: Target[] = [];
    const defaultWebpackHelpers = webpackHelpers();
    // get base config
    const buildTargets = this._initDefaultBuildTarget();
    const extraTargets = (
      await this._cliContext.pluginRunner.addExtraTarget({
        createConfig: this._createConfig.bind(this),
        mode: this._cliContext.mode,
        webpack
      })
    ).filter(Boolean);
    buildTargets.push(...extraTargets);

    for (const buildTarget of buildTargets) {
      let { chain, name } = buildTarget;
      // modify config by api hooks
      chain = await this._cliContext.pluginRunner.configWebpack(chain, {
        name,
        mode: this._cliContext.mode,
        helpers: defaultWebpackHelpers,
        webpack,
        resolveWebpackModule(path: string) {
          return resolveWebpackModule(path);
        }
      });
      if (hasEntry(chain)) {
        const chainConfig = chain.toConfig();
        logger.debug(`${name} Config`);
        logger.debug(inspect(chainConfig.resolve?.alias, { depth: 10 }));
        targets.push({ name, config: chainConfig });
      }
    }
    return targets;
  }
}

export async function getBundler(ctx: IPluginContext): Promise<Bundler> {
  try {
    await setupTypeScript(ctx.paths, ctx.mode === 'production');
    const options = {
      ...defaultBundleOptions,
      preBundle: ctx.config.experimental.preBundle,
      ignoreTypeScriptErrors: ctx.config.typescript.ignoreBuildErrors
    };
    if (ctx.mode !== 'development') {
      options.preBundle = false;
    }
    const bundler = new WebpackBundler(options, ctx);
    await bundler.init();
    return bundler;
  } catch (err: any) {
    if (isFatalError(err)) {
      logger.error(err.message);
      process.exit(1);
    }

    throw err;
  }
}
