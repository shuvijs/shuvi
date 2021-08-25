import { APIHooks } from '@shuvi/types';
import ForkTsCheckerWebpackPlugin, {
  Issue,
  createCodeFrameFormatter
} from '@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import Logger from '@shuvi/utils/lib/logger';
import { inspect } from 'util';
import webpack, {
  MultiCompiler as WebapckMultiCompiler,
  Compiler as WebapckCompiler,
  Configuration
} from 'webpack';
import { Api } from '../api';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER,
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR
} from '../constants';
import {
  createWebpackConfig,
  getClientEntry,
  getServerEntry,
  IWebpackConfigOptions
} from './config';
import { runCompiler, BundlerResult } from './runCompiler';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';

type CompilerErr = {
  moduleName: string;
  message: string;
};
type CompilerDiagnostics = {
  errors: CompilerErr[];
  warnings: CompilerErr[];
};

interface WatchTargetOptions {
  typeChecking?: boolean;
  onErrors?(errors: CompilerErr[]): void;
  onWarns?(warns: CompilerErr[]): void;
}

interface Target {
  name: string;
  config: Configuration;
}

const logger = Logger('shuvi:bundler');

class WebpackBundler {
  private _api: Api;
  private _compiler: WebapckMultiCompiler | null = null;
  private _internalTargets: Target[] = [];
  private _extraTargets: Target[] = [];

  constructor(api: Api) {
    this._api = api;
  }

  async getWebpackCompiler(): Promise<WebapckMultiCompiler> {
    if (!this._compiler) {
      this._internalTargets = await this._getInternalTargets();

      this._extraTargets = ((await this._api.callHook<
        APIHooks.IHookBundlerExtraTarget
      >(
        {
          name: 'bundler:extraTarget',
          parallel: true
        },
        {
          createConfig: this._createConfig.bind(this),
          mode: this._api.mode,
          webpack
        }
      )) as any).filter(Boolean) as Target[];
      this._compiler = webpack(
        [...this._internalTargets, ...this._extraTargets].map(t => t.config)
      );

      let isFirstSuccessfulCompile = true;
      this._compiler.hooks.done.tap('done', async stats => {
        const warnings: webpack.StatsError[] = [];
        const errors: webpack.StatsError[] = [];
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
          setImmediate(first => {
            // make sure this event is fired after all bundler:target-done
            this._api.emitEvent<APIHooks.IEventBundlerDone>('bundler:done', {
              first,
              stats: stats
            });
          }, isFirstSuccessfulCompile);
          isFirstSuccessfulCompile = false;
        }
      });
    }

    return this._compiler!;
  }

  getSubCompiler(name: string): WebapckCompiler | undefined {
    if (!this._compiler) {
      return;
    }

    return this._compiler.compilers.find(compiler => compiler.name === name);
  }

  watch(options: WatchTargetOptions) {
    if (!this._compiler) {
      console.warn('please create compiler before watch');
      return;
    }

    [...this._internalTargets, ...this._extraTargets].forEach(({ name }) => {
      if (name === BUNDLER_TARGET_CLIENT) {
        this._watchTarget(name, {
          ...options,
          typeChecking: true
        });
      } else {
        this._watchTarget(name, {
          typeChecking: false,
          onErrors(errros) {
            console.log(errros[0]);
          },
          onWarns(warns) {
            console.log(warns[0]);
          }
        });
      }
    });
  }

  async build(): Promise<BundlerResult> {
    const compiler = await this.getWebpackCompiler();
    return runCompiler(compiler);
  }

  public async resolveWebpackConfig(): Promise<Target[]> {
    return await this._getInternalTargets();
  }

  private _createConfig(options: IWebpackConfigOptions) {
    return createWebpackConfig(this._api, options);
  }

  private _watchTarget(name: string, options: WatchTargetOptions = {}) {
    const api = this._api;
    const compiler = this.getSubCompiler(name)!;
    let isFirstSuccessfulCompile = true;
    let tsMessagesPromise: Promise<CompilerDiagnostics> | undefined;
    let tsMessagesResolver: (diagnostics: CompilerDiagnostics) => void;
    let isInvalid = true;

    const _log = (...args: string[]) => console.log(`[${name}]`, ...args);
    compiler.hooks.invalid.tap(`invalid`, () => {
      tsMessagesPromise = undefined;
      isInvalid = true;
      _log('Compiling...');
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
      const hasErrors = !!statsData.errors?.length;
      const typePromise = tsMessagesPromise;

      if (options.typeChecking && useTypeScript && !hasErrors) {
        const messages = await tsMessagesPromise;
        if (typePromise !== tsMessagesPromise) {
          // a new compilation started so we don't care about this
          return;
        }

        if (messages) {
          if (
            messages.errors &&
            messages.errors.length > 0 &&
            options.onErrors
          ) {
            options.onErrors(messages.errors);
          } else if (
            messages.warnings &&
            messages.warnings.length > 0 &&
            options.onWarns
          ) {
            options.onWarns(messages.warnings);
          }
        }
      }

      const messages = formatWebpackMessages(statsData);
      const isSuccessful =
        !messages.errors?.length && !messages.warnings?.length;
      if (isSuccessful) {
        _log('Compiled successfully!');
        await api.emitEvent<APIHooks.IEventTargetDone>('bundler:targetDone', {
          first: isFirstSuccessfulCompile,
          name: compiler.name!,
          stats
        });
        isFirstSuccessfulCompile = false;
      }

      // If errors exist, only show errors.
      if (messages.errors?.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        _log('Failed to compile.\n');
        _log(messages.errors.join('\n\n'));
        return;
      }

      // Show warnings if no errors were found.
      if (messages.warnings?.length) {
        _log('Compiled with warnings.\n');
        _log(messages.warnings.join('\n\n'));
      }
    });
  }

  private async _getInternalTargets(): Promise<Target[]> {
    const clientWebpackHelpers = webpackHelpers();
    // create base config
    let clientChain = createWebpackConfig(this._api, {
      name: BUNDLER_TARGET_CLIENT,
      node: false,
      entry: getClientEntry(this._api),
      outputDir: BUILD_CLIENT_DIR,
      webpackHelpers: clientWebpackHelpers
    });
    // modify config by api hooks
    clientChain = await this._api.callHook<APIHooks.IHookBundlerConfig>(
      {
        name: 'bundler:configTarget',
        initialValue: clientChain
      },
      {
        name: BUNDLER_TARGET_CLIENT,
        mode: this._api.mode,
        helpers: clientWebpackHelpers,
        webpack: webpack
      }
    );

    const serverWebpackHelpers = webpackHelpers();
    let serverChain = createWebpackConfig(this._api, {
      name: BUNDLER_TARGET_SERVER,
      node: true,
      entry: getServerEntry(this._api),
      outputDir: BUILD_SERVER_DIR,
      webpackHelpers: serverWebpackHelpers
    });
    serverChain = await this._api.callHook<APIHooks.IHookBundlerConfig>(
      {
        name: 'bundler:configTarget',
        initialValue: serverChain
      },
      {
        name: BUNDLER_TARGET_SERVER,
        mode: this._api.mode,
        helpers: serverWebpackHelpers,
        webpack: webpack
      }
    );

    const targets: Target[] = [];

    const clientConfig = clientChain.toConfig();
    logger.debug('Client Config');
    logger.debug(inspect(clientConfig.resolve?.plugins, { depth: 10 }));
    targets.push({ name: BUNDLER_TARGET_CLIENT, config: clientConfig });

    const serverConfig = serverChain.toConfig();
    logger.debug('Server Config');
    logger.debug(inspect(serverConfig.module, { depth: 10 }));
    //targets.push({ name: BUNDLER_TARGET_SERVER, config: serverConfig });

    return targets;
  }
}

export function getBundler(_api: Api) {
  return new WebpackBundler(_api);
}
