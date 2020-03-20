import babelLoader from "babel-loader";
import babelPreset from "../../babel/preset";

interface BabeLoaderlOption {
  cacheDirectory: string | false;
}

interface CustomOption {
  isNode: boolean;
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
              cacheCompression: false
            }
          : {
              cacheDirectory: false
            },
        opts
      );

      delete loader.isNode;
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
