import invariant from '@shuvi/utils/lib/invariant';
import resolve from '@shuvi/utils/lib/resolve';
import { isPluginInstance } from '@shuvi/hook';
import {
  createPlugin,
  ICliPluginInstance,
  ICliPluginConstructor
} from './plugin';
import {
  IPreset,
  IPluginConfig,
  IPresetConfig,
  IPresetSpec,
  ICliContext
} from './types';

interface ResolvePluginOptions {
  dir: string;
}

function resolvePlugin(
  pluginConfig: IPluginConfig,
  resolveOptions: ResolvePluginOptions
): ICliPluginInstance {
  let pluginOrPath: string | ((param: any) => ICliPluginInstance);
  let options: any;

  if (Array.isArray(pluginConfig)) {
    pluginOrPath = pluginConfig[0];
    options = pluginConfig[1];
    if (typeof pluginOrPath === 'function') {
      return pluginOrPath(options);
    }
    if (typeof pluginOrPath === 'object' && isPluginInstance(pluginOrPath)) {
      return pluginOrPath;
    }
  } else if (typeof pluginConfig === 'string') {
    pluginOrPath = pluginConfig;
    options = {};
  } else if (typeof pluginConfig === 'object') {
    if (isPluginInstance(pluginConfig)) {
      return pluginConfig as ICliPluginInstance;
    }
    return createPlugin(pluginConfig as ICliPluginConstructor);
  } else {
    throw new Error(
      `Plugin must be one of type [string, array, ICliPluginConstructor, ICliPluginInstance]`
    );
  }

  pluginOrPath = resolve.sync(pluginOrPath, { basedir: resolveOptions.dir });
  let pluginInst: any;
  let plugin = require(pluginOrPath);
  plugin = plugin.default || plugin;
  if (isPluginInstance(plugin)) {
    pluginInst = plugin;
  } else if (typeof plugin === 'function') {
    pluginInst = plugin(options);
  } else {
    pluginInst = createPlugin({});
  }
  return pluginInst;
}

function resolvePreset(
  presetConfig: IPresetConfig,
  resolveOptions: ResolvePluginOptions
): IPreset {
  let presetPath: string;
  let options: any;

  if (Array.isArray(presetConfig)) {
    presetPath = presetConfig[0];
    const nameOrOption = presetConfig[1];
    if (typeof nameOrOption === 'string') {
      options = {};
    } else {
      options = nameOrOption;
    }
  } else if (typeof presetConfig === 'string') {
    presetPath = presetConfig;
    options = {};
  } else {
    throw new Error(`Plugin must be one of type [string, array, function]`);
  }

  presetPath = resolve.sync(presetPath, { basedir: resolveOptions.dir });

  const id = presetPath;
  let preset = require(presetPath);
  preset = preset.default || preset;
  const presetFn: IPresetSpec = () => {
    return preset(options);
  };

  return {
    id,
    get: () => presetFn
  };
}

export function resolvePlugins(
  plugins: IPluginConfig[],
  options: ResolvePluginOptions
): ICliPluginInstance[] {
  return plugins.map(plugin => resolvePlugin(plugin, options));
}

export function resolvePresets(
  presets: IPresetConfig[],
  options: ResolvePluginOptions
): IPreset[] {
  return presets.map(preset => resolvePreset(preset, options));
}

function initPreset(
  rootDir: string,
  context: ICliContext,
  preset: IPreset,
  collection: ICliPluginInstance[]
) {
  const { id, get: getPreset } = preset;
  const { presets, plugins } = getPreset()(context);

  if (presets) {
    invariant(
      Array.isArray(presets),
      `presets returned from preset ${id} must be Array.`
    );

    const resolvedPresets = resolvePresets(presets, {
      dir: rootDir
    });

    for (const preset of resolvedPresets) {
      initPreset(rootDir, context, preset, collection);
    }
  }

  if (plugins) {
    invariant(
      Array.isArray(plugins),
      `presets returned from preset ${id} must be Array.`
    );

    collection.push(
      ...resolvePlugins(plugins, {
        dir: rootDir
      })
    );
  }
}

export function getPlugins(context: ICliContext): ICliPluginInstance[] {
  const { config } = context;
  const rootDir = config.rootDir;
  const presetPlugins: ICliPluginInstance[] = [];
  // init presets
  const presets = resolvePresets(config.presets || [], {
    dir: rootDir
  });

  for (const preset of presets) {
    initPreset(rootDir, context, preset, presetPlugins);
  }

  // init plugins
  const plugins = resolvePlugins(config.plugins || [], {
    dir: rootDir
  });
  const allPlugins = presetPlugins.concat(plugins);
  return allPlugins;
}
