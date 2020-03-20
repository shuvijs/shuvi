import { ROUTE_ID_REGEXP } from "@shuvi/shared/lib/router";
import { Bundler } from "@shuvi/types";
import { Compiler as WebpackCompiler } from "webpack";
// @ts-ignore
import Entrypoint from "webpack/lib/Entrypoint";
import { RawSource } from "webpack-sources";

import ModuleItem = Bundler.IModuleItem;
import Manifest = Bundler.IManifest;

const defaultOptions = {
  filename: "build-manifest.json",
  modules: false
};

interface Options {
  filename: string;
  modules: boolean;
}

function getFileExt(filepath: string): string {
  const match = filepath.match(/\.(\w+)$/);
  if (!match) return "";
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

  apply(compiler: WebpackCompiler) {
    compiler.hooks.emit.tapAsync("BuildManifest", (compilation, callback) => {
      const assetMap = (this._manifest = {
        entries: {},
        routes: {},
        chunks: {},
        loadble: {}
      });

      compilation.chunkGroups.forEach(chunkGroup => {
        if (chunkGroup instanceof Entrypoint) {
          this._collectEntries(chunkGroup);
          return;
        }

        if (!chunkGroup.isInitial()) {
          if (this._options.modules) {
            this._collectModules(chunkGroup, compiler);
          }
        }
      });

      this._manifest.loadble = Object.keys(this._manifest.loadble)
        .sort()
        // eslint-disable-next-line no-sequences
        .reduce((a, c) => ((a[c] = this._manifest.loadble[c]), a), {} as any);

      for (const chunk of compilation.chunks) {
        if (!chunk.name || !chunk.files) {
          continue;
        }

        for (const file of chunk.files) {
          if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
            continue;
          }

          const ext = getFileExt(file);
          const normalizedPath = file.replace(/\\/g, "/");

          // route chunk
          if (ROUTE_ID_REGEXP.test(chunk.name)) {
            this._pushRoute(chunk.name, ext, normalizedPath);
            continue;
          }

          // normal chunk
          if (ext === "js") {
            this._pushChunk(chunk.name, normalizedPath);
          }
        }
      }

      compilation.assets[this._options.filename] = new RawSource(
        JSON.stringify(assetMap, null, 2)
      );

      callback();
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
        this._pushEntries(entrypoint.name, ext, file.replace(/\\/g, "/"));
      }
    }
  }

  private _collectModules(chunkGroup: any, compiler: WebpackCompiler): void {
    const context = compiler.options.context;
    chunkGroup.origins.forEach((chunkGroupOrigin: any) => {
      const { request } = chunkGroupOrigin;
      chunkGroup.chunks.forEach((chunk: any) => {
        if (chunk.canBeInitial()) {
          return;
        }

        chunk.files.forEach((file: string) => {
          const isJs = file.match(/\.js$/) && file.match(/^static\/chunks\//);
          const isCss = file.match(/\.css$/) && file.match(/^static\/css\//);
          if (isJs || isCss) {
            this._pushLoadableModules(request, file);
          }
        });

        for (const module of chunk.modulesIterable) {
          let id = module.id;
          if (!module.type.startsWith("javascript")) {
            continue;
          }

          let name =
            typeof module.libIdent === "function"
              ? module.libIdent({ context })
              : null;

          if (name.endsWith(".css")) {
            continue;
          }

          this._pushLoadableModules(request, {
            id,
            name
          });
        }
      });
    });
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

  private _pushRoute(name: string, ext: string, value: string) {
    const routes = this._manifest.routes;
    if (!routes[name]) {
      routes[name] = {
        js: []
      };
    }
    if (!routes[name][ext]) {
      routes[name][ext] = [value];
    } else {
      routes[name][ext].push(value);
    }
  }

  private _pushChunk(name: string, value: string) {
    const chunks = this._manifest.chunks;
    chunks[name] = value;
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

    if (typeof value === "string") {
      modules[request].files.push(value);
    } else if (
      // Avoid duplicate files
      !modules[request].children.some(item => item.id === module.id)
    ) {
      modules[request].children.push(value);
    }
  }
}
