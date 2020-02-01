import url from "url";
import { Compiler, compilation } from "webpack";
import { RawSource } from "webpack-sources";

interface Module {
  id: string;
  name: string;
  file: string;
  publicPath: string;
}

interface AssetMap {
  entries: {
    [s: string]: string[];
  };
  chunks: {
    [s: string]: string;
  };
  modules: {
    [s: string]: Module[];
  };
}

const defaultOptions = {
  filename: "build-manifest.json",
  modules: false
};

interface Options {
  filename: string;
  modules: boolean;
}

function getModules(compiler: Compiler, compilation: compilation.Compilation) {
  let context = compiler.options.context;
  let manifest: { [k: string]: Module[] } = {};

  compilation.chunkGroups.forEach(chunkGroup => {
    if (chunkGroup.isInitial()) {
      return;
    }

    chunkGroup.origins.forEach((chunkGroupOrigin: any) => {
      const { request } = chunkGroupOrigin;

      chunkGroup.chunks.forEach((chunk: any) => {
        chunk.files.forEach((file: string) => {
          if (!file.match(/\.js$/) || !file.match(/^static\/chunks\//)) {
            return;
          }

          let publicPath = url.resolve(
            compilation.outputOptions.publicPath || "",
            file
          );

          for (const module of chunk.modulesIterable) {
            let id = module.id;
            let name =
              typeof module.libIdent === "function"
                ? module.libIdent({ context })
                : null;

            if (!manifest[request]) {
              manifest[request] = [];
            }

            // Avoid duplicate files
            if (
              manifest[request].some(
                item => item.id === id && item.file === file
              )
            ) {
              continue;
            }

            manifest[request].push({
              id,
              name,
              file,
              publicPath
            });
          }
        });
      });
    });
  });

  manifest = Object.keys(manifest)
    .sort()
    // eslint-disable-next-line no-sequences
    .reduce((a, c) => ((a[c] = manifest[c]), a), {} as any);

  return manifest;
}

// This plugin creates a build-manifest.json for all assets that are being output
// It has a mapping of "entry" filename to real filename. Because the real filename can be hashed in production
export default class BuildManifestPlugin {
  private _options: Options;

  constructor(options: Partial<Options> = {}) {
    this._options = {
      ...defaultOptions,
      ...options
    };
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync("BuildManifest", (compilation, callback) => {
      const assetMap: AssetMap = {
        entries: {},
        chunks: {},
        modules: {}
      };

      if (this._options.modules) {
        assetMap.modules = getModules(compiler, compilation);
      }

      // compilation.entrypoints is a Map object, so iterating over it 0 is the key and 1 is the value
      for (const [, entrypoint] of compilation.entrypoints.entries()) {
        const filesForEntry: string[] = [];
        for (const chunk of entrypoint.chunks) {
          // If there's no name or no files
          if (!chunk.name || !chunk.files) {
            continue;
          }

          for (const file of chunk.files) {
            if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
              continue;
            }

            // Only `.js` and `.css` files are added for now. In the future we can also handle other file types.
            if (!/\.js$/.test(file) && !/\.css$/.test(file)) {
              continue;
            }

            filesForEntry.push(file.replace(/\\/g, "/"));
          }
        }

        assetMap.entries[entrypoint.name] = [...filesForEntry];
      }

      let files = [];
      for (let index = 0; index < compilation.chunks.length; index++) {
        const chunk = compilation.chunks[index];
        const chunkFiles = chunk.files;
        for (let index = 0; index < chunkFiles.length; index++) {
          const filepath = chunkFiles[index];
          const name = chunk.name ? chunk.name : filepath;

          files.push({
            filepath: filepath,
            chunk: chunk,
            name: name,
            isInitial: chunk.isOnlyInitial(),
            isChunk: true,
            isAsset: false,
            isModuleAsset: false
          });
        }
      }

      files = files.filter(function(file) {
        // Don't add hot updates to manifest
        const isUpdateChunk = /\.hot-update\.js$/.test(file.filepath);
        return !isUpdateChunk;
      });

      files.forEach(file => {
        assetMap.chunks[file.name] = file.filepath;
      });

      compilation.assets[this._options.filename] = new RawSource(
        JSON.stringify(assetMap, null, 2)
      );

      callback();
    });
  }
}
