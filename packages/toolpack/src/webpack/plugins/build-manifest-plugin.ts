import { Bundler } from '@shuvi/types';
import webpack, { Compiler as WebpackCompiler, Compilation } from 'webpack';
// @ts-ignore
import Entrypoint from 'webpack/lib/Entrypoint';

const { RawSource } = webpack.sources;

import ModuleItem = Bundler.IModuleItem;
import Manifest = Bundler.IManifest;

const defaultOptions = {
  filename: 'build-manifest.json',
  modules: false,
  chunkRequest: false
};

interface Options {
  filename: string;
  modules: boolean;
  chunkRequest: boolean;
}

function getFileExt(filepath: string): string {
  const match = filepath.match(/\.(\w+)$/);
  if (!match) return '';
  return match[1];
}

// function findEntrypointName(chunkGorup: any): string[] {
//   const entrypoints: any[] = [];
//   const queue: any[] = [chunkGorup];
//   while (queue.length) {
//     const item = queue.shift();
//     for (const parent of item.getParents()) {
//       if (parent instanceof Entrypoint) {
//         entrypoints.push(parent.name);
//       } else {
//         queue.push(parent);
//       }
//     }
//   }

//   return entrypoints;
// }

// This plugin creates a build-manifest.json for all assets that are being output
// It has a mapping of "entry" filename to real filename. Because the real filename can be hashed in production
export default class BuildManifestPlugin {
  private _options: Options;
  private _manifest!: Manifest;

  constructor(options: Partial<Options> = {}) {
    this._options = {
      ...defaultOptions,
      ...options
    };
  }

  createAssets(compiler: WebpackCompiler, compilation: Compilation) {
    const assetMap = (this._manifest = {
      entries: {},
      bundles: {},
      chunkRequest: {},
      loadble: {}
    });

    compilation.chunkGroups.forEach(chunkGroup => {
      if (chunkGroup instanceof Entrypoint) {
        this._collectEntries(chunkGroup);
      }

      this._collect(chunkGroup, compiler, compilation);
    });

    this._manifest.loadble = Object.keys(this._manifest.loadble)
      .sort()
      // eslint-disable-next-line no-sequences
      .reduce((a, c) => ((a[c] = this._manifest.loadble[c]), a), {} as any);

    return assetMap;
  }

  apply(compiler: WebpackCompiler) {
    compiler.hooks.make.tap('BuildManifestPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BuildManifestPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets: any) => {
          assets[this._options.filename] = new RawSource(
            JSON.stringify(this.createAssets(compiler, compilation), null, 2),
            true
          );
        }
      );
    });
  }

  private _collectEntries(entrypoint: any) {
    for (const chunk of entrypoint.chunks) {
      // If there's no name or no files
      if (!chunk.name || !chunk.files) {
        continue;
      }

      for (const file of chunk.files) {
        if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
          continue;
        }

        const ext = getFileExt(file);
        this._pushEntries(entrypoint.name, ext, file.replace(/\\/g, '/'));
      }
    }
  }

  private _collect(
    chunkGroup: any,
    compiler: WebpackCompiler,
    compilation: Compilation
  ): void {
    const collectModules = this._options.modules;
    chunkGroup.origins.forEach((chunkGroupOrigin: any) => {
      const { request } = chunkGroupOrigin;
      const ctx = { request, compiler, compilation };
      chunkGroup.chunks.forEach((chunk: any) => {
        this._collectChunk(chunk, ctx);
        if (collectModules) {
          this._collectChunkModule(chunk, ctx);
        }
      });
    });
  }

  private _collectChunk(
    chunk: any,
    {
      request
    }: {
      request: string;
    }
  ) {
    if (!chunk.files) {
      return;
    }

    for (const file of chunk.files) {
      if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
        continue;
      }

      const ext = getFileExt(file);
      const normalizedPath = file.replace(/\\/g, '/');

      // normal chunk
      if (ext === 'js') {
        if (chunk.isOnlyInitial()) {
          this._pushBundle({
            name: chunk.name,
            file: normalizedPath
          });
        }

        this._pushChunkRequest({
          file: normalizedPath,
          request
        });
      }
    }
  }

  private _collectChunkModule(
    chunk: any,
    {
      request,
      compiler,
      compilation
    }: {
      request: string;
      compiler: WebpackCompiler;
      compilation: Compilation;
    }
  ) {
    if (chunk.canBeInitial()) {
      return;
    }

    const context = compiler.options.context!;
    chunk.files.forEach((file: string) => {
      const isJs = file.match(/\.js$/) && file.match(/^static\/chunks\//);
      const isCss = file.match(/\.css$/) && file.match(/^static\/css\//);
      if (isJs || isCss) {
        this._pushLoadableModules(request, file);
      }
    });

    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk
    )) {
      let id = compilation.chunkGraph.getModuleId(module);
      if (!module.type.startsWith('javascript')) {
        continue;
      }

      let name =
        typeof module.libIdent === 'function'
          ? module.libIdent({ context })
          : null;

      if (!name || name.endsWith('.css')) {
        continue;
      }

      this._pushLoadableModules(request, {
        id,
        name
      } as ModuleItem);
    }
  }

  private _pushEntries(name: string, ext: string, value: string) {
    const entries = this._manifest.entries;
    if (!entries[name]) {
      entries[name] = {
        js: []
      };
    }
    if (!entries[name][ext]) {
      entries[name][ext] = [value];
    } else {
      entries[name][ext].push(value);
    }
  }

  private _pushBundle({ name, file }: { name: string; file: string }) {
    if (name) {
      this._manifest.bundles[name] = file;
    }
  }

  private _pushChunkRequest({
    file,
    request
  }: {
    file: string;
    request: string;
  }) {
    if (this._options.chunkRequest && request) {
      this._manifest.chunkRequest[file] = request;
    }
  }

  private _pushLoadableModules(request: string, module: ModuleItem): void;
  private _pushLoadableModules(request: string, module: string): void;
  private _pushLoadableModules(request: string, value: string | ModuleItem) {
    const modules = this._manifest.loadble;
    if (!modules[request]) {
      modules[request] = {
        files: [],
        children: []
      };
    }

    if (typeof value === 'string') {
      modules[request].files.push(value);
    } else if (
      // Avoid duplicate files
      !modules[request].children.some(item => item.id === module.id)
    ) {
      modules[request].children.push(value);
    }
  }
}
