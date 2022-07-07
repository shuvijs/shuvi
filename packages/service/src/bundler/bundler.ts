import { Configuration, WebpackChain } from '@shuvi/toolpack/lib/webpack';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  removeSync,
  renameSync,
  existsSync,
  writeFileSync,
  writeFile,
  mkdirpSync,
  emptyDirSync
} from 'fs-extra';
import ForkTsCheckerWebpackPlugin, {
  Issue,
  createCodeFrameFormatter
} from '@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin';
import formatWebpackMessages from '@shuvi/toolpack/lib/utils/formatWebpackMessages';
import Logger from '@shuvi/utils/lib/logger';
import invariant from '@shuvi/utils/lib/invariant';
import { inspect } from 'util';
import webpack, {
  MultiCompiler as WebapckMultiCompiler,
  Compiler as WebapckCompiler,
  webpackPath,
  WebpackVirtualModules,
  DynamicDLLPlugin,
  ModuleSnapshot
} from '@shuvi/toolpack/lib/webpack';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IPluginContext } from '../core';
import { Target, TargetChain } from '../core/lifecycle';
import { BUNDLER_DEFAULT_TARGET } from '@shuvi/shared/lib/constants';
import { createWebpackConfig, IWebpackConfigOptions } from './config';
import { runCompiler, BundlerResult } from './runCompiler';
import {
  BUILD_DEFAULT_DIR,
  DLL_NAME,
  DEFAULT_DLL_PUBLIC_PATH,
  DLL_FILENAME,
  DEFAULT_TMP_DIR_NAME
} from '../constants';
import { setupTypeScript } from './typescript';
import {
  isString,
  isArray,
  writeUpdate,
  getMetadata,
  checkNotInNodeModules,
  Metadata,
  writeMetadata,
  getDllDir,
  getDllPendingDir,
  getDepsDir,
  Dep,
  version,
  getConfig
} from './dynamicDll';

type CompilerErr = {
  moduleName: string;
  message: string;
};
type CompilerDiagnostics = {
  errors: CompilerErr[];
  warnings: CompilerErr[];
};

type ShareConfig = Record<string, any>;
interface WatchTargetOptions {
  typeChecking?: boolean;
  onErrors?(errors: CompilerErr[]): void;
  onWarns?(warns: CompilerErr[]): void;
}
interface BuildOptions {
  outputDir: string;
  configWebpack?: (chain: WebpackChain) => WebpackChain;
  shared?: ShareConfig;
  externals?: Configuration['externals'];
  esmFullSpecific?: Boolean;
  force?: boolean;
  deps?: any;
  entry?: any;
}

export interface NormalizedBundlerOptions {
  ignoreTypeScriptErrors: boolean;
}

export type BundlerOptions = Partial<NormalizedBundlerOptions>;

const defaultBundleOptions: NormalizedBundlerOptions = {
  ignoreTypeScriptErrors: false
};

const logger = Logger('shuvi:bundler');

const hasEntry = (chain: WebpackChain) => chain.entryPoints.values().length > 0;

function getHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').substring(0, 8);
}

/**
 * hash everything that can change the build result
 *
 * @param {BuildOptions} options
 * @returns {string}
 */
function getMainHash(options: BuildOptions): string {
  let content = JSON.stringify({
    shared: options.shared
  });
  return getHash([version, content].join(''));
}

function getBuildHash(hash: string, snapshot: ModuleSnapshot) {
  return getHash(hash + JSON.stringify(snapshot));
}

function isSnapshotSame(pre: ModuleSnapshot, cur: ModuleSnapshot): boolean {
  const keys = Object.keys(cur);

  for (let index = 0; index < keys.length; index++) {
    const id = keys[index];
    const preItem = pre[id];
    const nextItem = cur[id];
    if (!preItem) {
      return false;
    }

    if (preItem.version !== nextItem.version) {
      return false;
    }
  }

  return true;
}

async function buildDeps({ deps, dir }: { deps: Dep[]; dir: string }) {
  mkdirpSync(dir);

  // expose files
  await Promise.all(
    deps.map(async dep => {
      const content = await dep.buildExposeContent();
      await writeFile(dep.filename, content, 'utf-8');
    })
  );

  // index file
  writeFileSync(
    path.join(dir, 'index.js'),
    'export default "dynamicDll index.js";',
    'utf-8'
  );

  return deps;
}

function getWebpackConfig({
  deps,
  entry,
  outputDir,
  shared,
  externals,
  esmFullSpecific
}: {
  deps: Dep[];
  entry: string;
  outputDir: string;
  shared?: ShareConfig;
  externals: Configuration['externals'];
  esmFullSpecific: Boolean;
}) {
  const exposes = deps.reduce<Record<string, string>>((memo, dep) => {
    memo[`./${dep.request}`] = dep.filename;
    return memo;
  }, {});

  const chain = getConfig({
    name: DLL_NAME,
    entry,
    filename: DLL_FILENAME,
    outputDir,
    publicPath: DEFAULT_DLL_PUBLIC_PATH,
    shared,
    externals,
    esmFullSpecific,
    exposes
  });

  return chain.toConfig();
}

class WebpackBundler {
  private _cliContext: IPluginContext;
  private _compiler: WebapckMultiCompiler | null = null;
  private _options: NormalizedBundlerOptions;
  private _targets: Target[] = [];
  private _hasBuilt: boolean = false;
  private _dllPlugin: DynamicDLLPlugin | null = null;
  private _dirDll: string;
  private _nextBuild: ModuleSnapshot | undefined = undefined;

  constructor(options: NormalizedBundlerOptions, cliContext: IPluginContext) {
    this._options = options;
    this._cliContext = cliContext;
    this._dirDll = path.join(process.cwd(), DEFAULT_TMP_DIR_NAME);
  }

  async getWebpackCompiler(opts?: {
    deps: Dep[];
    entry: string;
    outputDir: string;
    shared?: ShareConfig;
    externals: Configuration['externals'];
    esmFullSpecific: Boolean;
  }): Promise<WebapckMultiCompiler> {
    const ignoreTypeScriptErrors = this._options.ignoreTypeScriptErrors;
    this._targets = await this._getTargets();
    if (this._cliContext.config.experimental.preBundle) {
      this._compiler = webpack(
        this._targets.map(({ config }) => {
          if (opts !== undefined) {
            return getWebpackConfig(opts);
          } else {
            const { asyncEntry, virtualModules } = this._makeAsyncEntry(
              config.entry
            );
            config.entry = asyncEntry;
            if (!config.plugins) {
              config.plugins = [];
            }
            this._dllPlugin = new DynamicDLLPlugin({
              exclude: [/webpack-hot-middleware\/client/, /react-refresh/],
              dllName: DLL_NAME,
              resolveWebpackModule: require,
              onSnapshot: this.handleSnapshot
            });

            config.plugins.push(
              new WebpackVirtualModules(virtualModules),
              new webpack.container.ModuleFederationPlugin(this._getMFconfig()),
              this._dllPlugin
            );
            return config;
          }
        })
      );
    } else {
      if (!this._compiler) {
        this._compiler = webpack(this._targets.map(t => t.config));
      }
    }

    let isFirstSuccessfulCompile = true;
    if (ignoreTypeScriptErrors) {
      console.log('Skipping validation of types');
      this._compiler.compilers.forEach(compiler => {
        ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).issues.tap(
          'afterTypeScriptCheck',
          (issues: Issue[]) => issues.filter(msg => msg.severity !== 'error')
        );
      });
    }

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
          this._cliContext.pluginRunner.afterBundlerDone({ first, stats });
        }, isFirstSuccessfulCompile);
        isFirstSuccessfulCompile = false;
      }
    });

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

    this._targets.forEach(({ name }) => {
      if (name === BUNDLER_DEFAULT_TARGET) {
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

  async build(
    snapshot?: ModuleSnapshot,
    options?: BuildOptions
  ): Promise<BundlerResult> {
    const compiler = await this.getWebpackCompiler();
    return runCompiler(compiler);
  }

  public async resolveWebpackConfig(): Promise<Target[]> {
    return await this._getTargets();
  }

  private _createConfig(options: IWebpackConfigOptions) {
    return createWebpackConfig(this._cliContext, options);
  }

  private _watchTarget(name: string, options: WatchTargetOptions = {}) {
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
        await this._cliContext.pluginRunner.afterBundlerTargetDone({
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

  private initDefaultBuildTarget(): TargetChain[] {
    const defaultWebpackHelpers = webpackHelpers();
    const defaultChain = createWebpackConfig(this._cliContext, {
      name: BUNDLER_DEFAULT_TARGET,
      node: false,
      entry: {},
      outputDir: BUILD_DEFAULT_DIR,
      webpackHelpers: defaultWebpackHelpers
    });
    return [
      {
        chain: defaultChain,
        name: BUNDLER_DEFAULT_TARGET
      }
    ];
  }
  private async _getTargets(): Promise<Target[]> {
    const targets: Target[] = [];
    const defaultWebpackHelpers = webpackHelpers();
    // get base config
    const buildTargets = this.initDefaultBuildTarget();
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
          if (!path.startsWith('webpack/')) {
            console.error(
              'path need startWith "webpack/" to resolve webpack module'
            );
          }
          return require(`${webpackPath}${path}`);
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

  private _makeAsyncEntry(entry: any) {
    const asyncEntry: Record<string, string> = {};
    const virtualModules: Record<string, string> = {};
    const entryObject = (
      isString(entry) || isArray(entry)
        ? { main: ([] as any).concat(entry) }
        : entry
    ) as Record<string, string[]>;

    for (const key of Object.keys(entryObject)) {
      const virtualPath = `./dynamic-dll-virtual-entry/${key}.js`;
      const virtualContent: string[] = [];
      const entryFiles = isArray(entryObject[key])
        ? entryObject[key]
        : ([entryObject[key]] as unknown as string[]);
      for (let entry of entryFiles) {
        invariant(isString(entry), 'wepback entry must be a string');
        virtualContent.push(`import('${entry}');`);
      }
      virtualModules[virtualPath] = virtualContent.join('\n');
      asyncEntry[key] = virtualPath;
    }

    return {
      asyncEntry,
      virtualModules
    };
  }

  private _getMFconfig() {
    return {
      name: '__',
      remotes: {
        // [NAME]: `${NAME}@${DETAULT_PUBLIC_PATH}${DLL_FILENAME}`,
        // https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes
        [DLL_NAME]: `
promise new Promise(resolve => {
  const remoteUrl = '${DEFAULT_DLL_PUBLIC_PATH}${DLL_FILENAME}';
  const script = document.createElement('script');
  script.src = remoteUrl;
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => {
        const promise = window['${DLL_NAME}'].get(request);
        return promise;
      },
      init: (arg) => {
        try {
          return window['${DLL_NAME}'].init(arg);
        } catch(e) {
          console.log('remote container already initialized');
        }
      }
    }
    resolve(proxy);
  }
  // inject this script with the src set to the versioned remoteEntry.js
  document.head.appendChild(script);
})`.trim()
      }
    };
  }

  private getRemovedModules(
    snapshot: ModuleSnapshot,
    originModules: ModuleSnapshot
  ) {
    return Object.keys(originModules).filter(key => {
      if (snapshot[key]) {
        return false;
      }
      return checkNotInNodeModules(key);
    });
  }

  private handleSnapshot = async (snapshot: ModuleSnapshot) => {
    if (this._hasBuilt) {
      writeUpdate(this._dirDll, snapshot);
      return;
    }
    const originModules = getMetadata(this._dirDll).modules;
    const diffNames = this.getRemovedModules(snapshot, originModules);
    const requiredSnapshot = { ...originModules, ...snapshot };

    diffNames.forEach(lib => {
      delete requiredSnapshot[lib];
    });

    await this._buildDll(requiredSnapshot, {
      outputDir: this._dirDll,
      force: process.env.DLL_FORCE_BUILD === 'true'
    });
    this._dllPlugin!.disableDllReference();
    this._hasBuilt = true;
  };

  private async _buildDll(
    snapshot: ModuleSnapshot,
    options: BuildOptions
  ): Promise<[boolean, Metadata]> {
    const {
      externals = {},
      shared = {},
      outputDir,
      force,
      esmFullSpecific = true
    } = options;

    const mainHash = getMainHash(options);
    const dllDir = getDllDir(outputDir);
    const preMetadata = getMetadata(outputDir);
    const metadata: Metadata = {
      hash: mainHash,
      buildHash: preMetadata.buildHash,
      modules: snapshot
    };

    if (
      !force &&
      preMetadata.hash === metadata.hash &&
      isSnapshotSame(preMetadata.modules, snapshot)
    ) {
      return [false, preMetadata];
    }

    const dllPendingDir = getDllPendingDir(outputDir);

    // create a temporal dir to build. This avoids leaving the dll
    // in a corrupted state if there is an error during the build
    if (existsSync(dllPendingDir)) {
      emptyDirSync(dllPendingDir);
    }

    const depsDir = getDepsDir(dllPendingDir);
    const deps = Object.entries(snapshot).map(
      ([request, { version, libraryPath }]) => {
        return new Dep({
          request,
          libraryPath,
          version,
          outputPath: depsDir
        });
      }
    );
    await buildDeps({
      deps,
      dir: depsDir
    });
    let timer = new Date().getTime();
    await runCompiler(
      await this.getWebpackCompiler({
        deps,
        entry: path.join(depsDir, 'index.js'),
        shared,
        externals,
        esmFullSpecific,
        outputDir: dllPendingDir
      })
    );
    console.log(`[dll Bundle time]: ${new Date().getTime() - timer}ms`);

    if (this._nextBuild) {
      const param = this._nextBuild;
      this._nextBuild = undefined;
      return await this._buildDll(param, options);
    }
    metadata.buildHash = getBuildHash(metadata.hash, snapshot);

    // finish build
    writeMetadata(dllPendingDir, metadata);
    removeSync(dllDir);
    renameSync(dllPendingDir, dllDir);

    return [true, metadata];
  }
}

export async function getBundler(
  ctx: IPluginContext,
  options: BundlerOptions = {}
) {
  await setupTypeScript(ctx.paths);
  return new WebpackBundler({ ...defaultBundleOptions, ...options }, ctx);
}
