import { IModuleItem, IManifest } from '../types';
import webpack, { Compiler, Compilation, Plugin, ChunkGroup } from 'webpack';
import Entrypoint from 'webpack/lib/Entrypoint';

const { RawSource } = webpack.sources;

type ModuleId = string | number;

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

// function findEntrypointName(chunkGroup: any): string[] {
//   const entrypoints: any[] = [];
//   const queue: any[] = [chunkGroup];
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
export default class BuildManifestPlugin implements Plugin {
  private _options: Options;
  private _manifest!: IManifest;

  constructor(options: Partial<Options> = {}) {
    this._options = {
      ...defaultOptions,
      ...options
    };
  }

  createAssets(compiler: Compiler, compilation: Compilation) {
    const assetMap = (this._manifest = {
      entries: {},
      bundles: {},
      chunkRequest: {},
      loadble: {}
    });

    const chunkRootModulesMap = new Map<ModuleId, Boolean>();
    compilation.chunks.forEach(chunk => {
      const { chunkGraph } = compilation;
      if (chunkGraph) {
        chunkGraph.getChunkRootModules(chunk).forEach(module => {
          const id = chunkGraph.getModuleId(module);
          if (id !== '') {
            chunkRootModulesMap.set(id, true);
          }
        });
      }
    });

    compilation.chunkGroups.forEach(chunkGroup => {
      if (chunkGroup instanceof Entrypoint) {
        this._collectEntries(chunkGroup);
      }

      this._collect(chunkGroup, compiler, compilation, chunkRootModulesMap);
    });

    this._manifest.loadble = Object.keys(this._manifest.loadble)
      .sort()
      // eslint-disable-next-line no-sequences
      .reduce((a, c) => ((a[c] = this._manifest.loadble[c]), a), {} as any);

    return assetMap;
  }

  apply(compiler: Compiler) {
    compiler.hooks.make.tap('BuildManifestPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BuildManifestPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          assets[this._options.filename] = new RawSource(
            JSON.stringify(this.createAssets(compiler, compilation), null, 2),
            true
          );
        }
      );
    });
  }

  private _collectEntries(entrypoint: ChunkGroup) {
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
        this._pushEntries(entrypoint.name!, ext, file.replace(/\\/g, '/'));
      }
    }
  }

  private _collect(
    chunkGroup: ChunkGroup,
    compiler: Compiler,
    compilation: Compilation,
    chunkRootModulesMap: Map<ModuleId, Boolean>
  ): void {
    const collectModules = this._options.modules;
    chunkGroup.origins.forEach(chunkGroupOrigin => {
      const { request } = chunkGroupOrigin;
      const ctx = { request, compiler, compilation, chunkRootModulesMap };
      chunkGroup.chunks.forEach(chunk => {
        this._collectChunk(chunk, ctx);
        if (collectModules) {
          this._collectChunkModule(chunk, ctx);
        }
      });
    });
  }

  private _collectChunk(
    chunk: webpack.Chunk,
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
    chunk: webpack.Chunk,
    {
      request,
      compiler,
      compilation,
      chunkRootModulesMap
    }: {
      request: string;
      compiler: Compiler;
      compilation: Compilation;
      chunkRootModulesMap: Map<ModuleId, Boolean>;
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

    const { chunkGraph } = compilation;

    if (chunkGraph) {
      for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
        let id = chunkGraph.getModuleId(module);
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

        if (chunkRootModulesMap.has(id)) {
          this._pushLoadableModules(request, {
            id,
            name
          } as IModuleItem);
        }
      }
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

  private _pushLoadableModules(request: string, module: IModuleItem): void;
  private _pushLoadableModules(request: string, file: string): void;
  private _pushLoadableModules(request: string, value: string | IModuleItem) {
    const modules = this._manifest.loadble;
    if (!modules[request]) {
      modules[request] = {
        files: [],
        children: []
      };
    }

    if (typeof value === 'string') {
      const existed = modules[request].files.some(file => file === value);
      if (!existed) {
        modules[request].files.push(value);
      }
    } else {
      const existed = modules[request].children.some(
        item => item.id === value.id
      );
      if (!existed) {
        modules[request].children.push(value);
      }
    }
  }
}
