import babelLoader from "babel-loader";
import path from "path";
import babelPreset from "../../babel/preset";

const env = process.env.NODE_ENV;
const isDevelopment = env === "development";
const isProduction = env === "production";

interface BabeLoaderlOption {
  cacheDirectory: string | false;
}

interface CustomOption {
  isNode: boolean;
}

function getCacheIdentifier(
  environment: string | false,
  runtime: "server" | "client",
  packages: string[]
) {
  environment = environment == null ? "" : environment.toString();
  let cacheIdentifier = `${environment}-${runtime}`;
  for (const packageName of packages) {
    cacheIdentifier += `:${packageName}@`;
    try {
      cacheIdentifier += require(`${packageName}/package.json`).version;
    } catch (_) {
      // ignored
    }
  }
  return cacheIdentifier;
}

module.exports = babelLoader.custom((babel: any) => {
  const presetItem = babel.createConfigItem(babelPreset, {
    type: "preset"
  });

  const configs = new Set();

  return {
    customOptions(opts: BabeLoaderlOption & CustomOption) {
      const custom = {
        isNode: opts.isNode
      };
      const loader = Object.assign(
        opts.cacheDirectory
          ? {
              cacheCompression: false,
              cacheDirectory: path.join(opts.cacheDirectory, "babel-loader"),
              cacheIdentifier: getCacheIdentifier(
                isProduction ? "production" : isDevelopment && "development",
                opts.isNode ? "server" : "client",
                ["@shuvi/toolpack"]
              )
            }
          : {
              cacheDirectory: false
            },
        opts
      );

      delete loader.isNode;
      delete loader.cacheDirectory;
      return { loader, custom };
    },
    config(
      this: any,
      cfg: any,
      {
        source,
        customOptions: { isNode }
      }: {
        source: any;
        customOptions: CustomOption;
      }
    ) {
      const options = Object.assign({}, cfg.options);

      if (cfg.hasFilesystemConfig()) {
        for (const file of [cfg.babelrc, cfg.config]) {
          // We only log for client compilation otherwise there will be double output
          if (file && !isNode && !configs.has(file)) {
            configs.add(file);
            console.log(`> Using external babel configuration`);
            console.log(`> Location: "${file}"`);
          }
        }
      } else {
        // Add our default preset if the no "babelrc" found.
        options.presets = [...options.presets, presetItem];
      }

      // pass option to babel-preset
      options.caller.isNode = isNode;

      options.plugins = options.plugins || [];

      options.plugins.push([
        require.resolve("babel-plugin-transform-define"),
        {
          "typeof window": isNode ? "undefined" : "object"
        },
        "shuvi-transform-define-instance"
      ]);

      return options;
    }
  };
});
