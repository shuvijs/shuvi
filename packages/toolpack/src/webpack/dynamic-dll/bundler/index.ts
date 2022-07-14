import { webpack, Configuration } from 'webpack';
import {
  removeSync,
  renameSync,
  existsSync,
  writeFileSync,
  writeFile,
  mkdirpSync,
  emptyDirSync
} from 'fs-extra';
import WebpackChain from 'webpack-chain';
import { join } from 'path';
import { createHash } from 'crypto';

import { DEFAULT_PUBLIC_PATH, NAME, DLL_FILENAME } from '../constants';
import { Dep } from '../dep';
import { ModuleSnapshot } from '../moduleCollector';
import { getMetadata, writeMetadata, Metadata } from '../metadata';
import { version, getDepsDir, getDllDir, getDllPendingDir } from '../utils';
import { getConfig } from './webpack-config';

export interface BuildOptions {
  outputDir: string;
  configWebpack?: (chain: WebpackChain) => WebpackChain;
  shared?: ShareConfig;
  externals?: Configuration['externals'];
  esmFullSpecific?: Boolean;
  force?: boolean;
}

export type ShareConfig = Record<string, any>;

type OnBuildComplete = (error?: null | Error) => void;

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
    name: NAME,
    entry,
    filename: DLL_FILENAME,
    outputDir,
    publicPath: DEFAULT_PUBLIC_PATH,
    shared,
    externals,
    esmFullSpecific,
    exposes
  });

  return chain.toConfig();
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
    join(dir, 'index.js'),
    'export default "dynamicDll index.js";',
    'utf-8'
  );

  return deps;
}

async function webpackBuild(config: Configuration) {
  return new Promise((resolve, reject) => {
    console.log(`[@shuvi/dll]: Bundle start`);
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err || stats?.hasErrors()) {
        if (err) {
          reject(err);
        }
        if (stats) {
          const errorMsg = stats.toString('errors-only');
          reject(new Error(errorMsg));
        }
      } else {
        resolve(stats);
      }
      compiler.close(() => {});
    });
  });
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

export class Bundler {
  private _nextBuild: ModuleSnapshot | null = null;
  private _completeFns: OnBuildComplete[] = [];
  private _isBuilding = false;

  async build(snapshot: ModuleSnapshot, options: BuildOptions) {
    if (this._isBuilding) {
      this._nextBuild = snapshot;
      return;
    }

    let error: any = null;
    this._isBuilding = true;
    let hasBuild: boolean = false;
    let timer = new Date().getTime();
    try {
      [hasBuild] = await this._buildDll(snapshot, options);
    } catch (err) {
      error = err;
    }

    this._isBuilding = false;

    if (error) {
      console.error(`[@shuvi/dll]: Bundle Error`);
      console.error(error);
    }

    this._completeFns.forEach(fn => fn(error));
    this._completeFns = [];

    if (hasBuild) {
      console.log(
        `[@shuvi/dll]: Bundle Success, cost ${new Date().getTime() - timer}ms`
      );
      timer = new Date().getTime();
    }
  }

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
    await webpackBuild(
      getWebpackConfig({
        deps,
        entry: join(depsDir, 'index.js'),
        shared,
        externals,
        esmFullSpecific,
        outputDir: dllPendingDir
      })
    );
    console.log(`[dll Bundle time]: ${new Date().getTime() - timer}ms`);

    if (this._nextBuild) {
      const param = this._nextBuild;
      this._nextBuild = null;
      return await this._buildDll(param, options);
    }
    metadata.buildHash = getBuildHash(metadata.hash, snapshot);

    // finish build
    writeMetadata(dllPendingDir, metadata);
    removeSync(dllDir);
    renameSync(dllPendingDir, dllDir);

    return [true, metadata];
  }

  onBuildComplete(fn: OnBuildComplete) {
    if (this._isBuilding) {
      this._completeFns.push(fn);
    } else {
      fn();
    }
  }
}
