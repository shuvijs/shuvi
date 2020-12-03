import babelLoader from 'babel-loader';
import babelPreset from '../../babel/preset';

interface BabeLoaderlOption {
  cacheDirectory: string | false;
}

interface CustomOption {
  isNode?: boolean;
  hasReactRefresh?: boolean;
}

function hasBuiltPreset(presets: { value: any }[]) {
  return presets.some(preset => preset && preset.value === babelPreset);
}

module.exports = babelLoader.custom((babel: any) => {
  const presetItem = babel.createConfigItem(babelPreset, {
    type: 'preset'
  });

  const configs = new Set();

  return {
    customOptions(opts: BabeLoaderlOption & CustomOption) {
      const custom = {
        isNode: opts.isNode,
        hasReactRefresh: opts.hasReactRefresh
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
      delete loader.hasReactRefresh;

      return { loader, custom };
    },
    config(
      this: any,
      cfg: any,
      {
        source,
        customOptions: { isNode, hasReactRefresh }
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
      }

      // Add built-in preset
      if (!hasBuiltPreset(options.presets)) {
        options.presets = [presetItem, ...options.presets];
      }

      // pass option to babel-preset
      options.caller.isNode = isNode;

      options.plugins = options.plugins || [];

      if (hasReactRefresh) {
        const reactRefreshPlugin = babel.createConfigItem(
          [require('react-refresh/babel'), { skipEnvCheck: true }],
          { type: 'plugin' }
        );

        options.plugins.unshift(reactRefreshPlugin);
      }

      options.plugins.push([
        require.resolve('babel-plugin-transform-define'),
        {
          'typeof window': isNode ? 'undefined' : 'object'
        },
        'shuvi-transform-define-instance'
      ]);

      return options;
    }
  };
});
