import { readFileSync, statSync } from 'fs-extra';
import { IncomingMessage, ServerResponse } from 'http';
import { extname, join } from 'path';
import { lookup } from 'mrmime';
import WebpackVirtualModules from 'webpack-virtual-modules';
import type * as webpackType from 'webpack';
import type { Configuration } from 'webpack';
import type WebpackChain from 'webpack-chain';

import invariant from '@shuvi/utils/lib/invariant';
import { NAME, DEFAULT_PUBLIC_PATH, DLL_FILENAME } from './constants';
import { Bundler, ShareConfig } from './bundler';
import { ModuleSnapshot } from './moduleCollector';
import { DynamicDLLPlugin } from './plugin/dynamic-dll-plugin';
import { getMetadata, writeUpdate } from './metadata';
import { getDllDir, isString, isArray } from './utils';
import { checkNotInNodeModules } from './helper/check-not-in-node-modules';

type IResolveWebpackModule = <T extends string>(
  path: T
) => T extends `webpack`
  ? typeof webpackType
  : T extends `webpack/${infer R}`
  ? any
  : never;
interface IOpts {
  cwd?: string;
  rootDir: string;
  cacheDir: string;
  resolveWebpackModule?: IResolveWebpackModule;
  include?: RegExp[];
  exclude?: RegExp[];
  shared?: ShareConfig;
  externals?: Configuration['externals'];
  esmFullSpecific?: Boolean;
}

function makeAsyncEntry(entry: any) {
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

export class DynamicDll {
  private _opts: IOpts;
  private _bundler: Bundler;
  private _rootDir: string;
  private _cacheDir: string;
  private _resolveWebpackModule: IResolveWebpackModule;
  private _dllPlugin: DynamicDLLPlugin;
  private _hasBuilt: boolean = false;

  constructor(opts: IOpts) {
    this._opts = opts;
    this._cacheDir = opts.cacheDir;
    this._rootDir = opts.rootDir;
    this._resolveWebpackModule = opts.resolveWebpackModule || require;

    this._bundler = new Bundler();

    this._dllPlugin = new DynamicDLLPlugin({
      include: opts.include,
      exclude: opts.exclude,
      dllName: NAME,
      resolveWebpackModule: this._resolveWebpackModule,
      onSnapshot: this.handleSnapshot
    });
  }

  private getRemovedModules(
    snapshot: ModuleSnapshot,
    originModules: ModuleSnapshot
  ) {
    return Object.keys(originModules).filter(key => {
      if (snapshot[key]) {
        return false;
      }
      return checkNotInNodeModules(key, this._rootDir);
    });
  }

  private handleSnapshot = async (snapshot: ModuleSnapshot) => {
    if (this._hasBuilt) {
      writeUpdate(this._cacheDir, snapshot);
      return;
    }
    const originModules = getMetadata(this._cacheDir).modules;
    const diffNames = this.getRemovedModules(snapshot, originModules);
    const requiredSnapshot = { ...originModules, ...snapshot };

    diffNames.forEach(lib => {
      delete requiredSnapshot[lib];
    });

    await this._buildDLL(requiredSnapshot);
    this._dllPlugin.disableDllReference();
    this._hasBuilt = true;
  };

  middleware = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (...args: any[]) => any
  ) => {
    const url = req.url || '';
    const shouldServe = url.startsWith(DEFAULT_PUBLIC_PATH);
    if (!shouldServe) {
      return next();
    }

    this._bundler.onBuildComplete(() => {
      const relativePath = url.replace(
        new RegExp(`^${DEFAULT_PUBLIC_PATH}`),
        '/'
      );
      const filePath = join(getDllDir(this._cacheDir), relativePath);
      const { mtime } = statSync(filePath);
      // Get the last modification time of the file and convert the time into a world time string
      let lastModified = mtime.toUTCString();
      const ifModifiedSince = req.headers['if-modified-since'];

      // Tell the browser what time to use the browser cache without asking the server directly, but it seems that it is not effective, and needs to learn why.
      res.setHeader('cache-control', 'no-cache');

      if (ifModifiedSince && lastModified <= ifModifiedSince) {
        // If the request header contains the request ifModifiedSince and the file is not modified, it returns 304
        res.writeHead(304, 'Not Modified');
        res.end();
        return;
      }
      // Return the header Last-Modified for the last modification time of the current request file
      res.setHeader('Last-Modified', lastModified);
      // Return file
      res.setHeader('content-type', lookup(extname(url)) || 'text/plain');
      const content = readFileSync(filePath);
      res.statusCode = 200;
      res.end(content);
    });
  };

  modifyWebpackChain = (chain: WebpackChain): WebpackChain => {
    const webpack = this._resolveWebpackModule('webpack');
    const entries = chain.entryPoints.entries();
    const entry = Object.keys(entries).reduce((acc, name) => {
      acc[name] = entries[name].values();
      return acc;
    }, {} as Record<string, string[]>);
    const { asyncEntry, virtualModules } = makeAsyncEntry(entry);
    chain.entryPoints.clear();
    chain.merge({
      entry: asyncEntry
    });
    chain
      .plugin('dynamic-virtual-modules')
      .use(WebpackVirtualModules, [virtualModules]);
    chain
      .plugin('dynamic-dll-mf')
      .use(webpack.container.ModuleFederationPlugin, [this._getMFconfig()]);
    chain.plugin('dynamic-dll-plugin').use(this._dllPlugin);
    return chain;
  };

  modifyWebpack = (config: Configuration): Configuration => {
    const { asyncEntry, virtualModules } = makeAsyncEntry(config.entry);

    config.entry = asyncEntry;
    const webpack = this._resolveWebpackModule('webpack') as typeof webpackType;
    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(
      new WebpackVirtualModules(virtualModules),
      new webpack.container.ModuleFederationPlugin(this._getMFconfig()),
      this._dllPlugin
    );

    return config;
  };

  private async _buildDLL(snapshot: ModuleSnapshot): Promise<void> {
    await this._bundler.build(snapshot, {
      outputDir: this._cacheDir,
      shared: this._opts.shared,
      externals: this._opts.externals,
      esmFullSpecific: this._opts.esmFullSpecific,
      force: process.env.DLL_FORCE_BUILD === 'true'
    });
  }

  private _getMFconfig() {
    return {
      name: '__',
      remotes: {
        // [NAME]: `${NAME}@${DEFAULT_PUBLIC_PATH}${DLL_FILENAME}`,
        // https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes
        [NAME]: `
promise new Promise(resolve => {
  const remoteUrl = '${DEFAULT_PUBLIC_PATH}${DLL_FILENAME}';
  const script = document.createElement('script');
  script.src = remoteUrl;
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => {
        const promise = window['${NAME}'].get(request);
        return promise;
      },
      init: (arg) => {
        try {
          return window['${NAME}'].init(arg);
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
}
