import { Compiler } from "webpack";
import { RawSource } from "webpack-sources";

interface AssetMap {
  entrypoints: string[];
}

// This plugin creates a build-manifest.json for all assets that are being output
// It has a mapping of "entry" filename to real filename. Because the real filename can be hashed in production
export default class BuildManifestPlugin {
  private filename: string = "build-manifest.json";

  constructor(options: { filename: string }) {
    this.filename = options.filename;
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync("BuildManifest", (compilation, callback) => {
      const assetMap: AssetMap = { entrypoints: [] };

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

        assetMap.entrypoints = [...filesForEntry];
      }

      compilation.assets[this.filename] = new RawSource(
        JSON.stringify(assetMap, null, 2)
      );

      callback();
    });
  }
}
