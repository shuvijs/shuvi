import invariant from '@shuvi/utils/lib/invariant';
import resolve from '@shuvi/utils/lib/resolve';
import { isPluginInstance } from '@shuvi/hook';
import path from 'path';
import { createPlugin, CorePluginInstance } from './lifecycle';
import {
  IPreset,
  IPluginConfig,
  IPresetConfig,
  IPresetSpec,
  IPluginContext,
  ResolvedPlugin
} from './apiTypes';

interface ResolvePluginOptions {
  dir: string;
}

export function resolvePlugin(
  pluginConfig: IPluginConfig,
  resolveOptions?: ResolvePluginOptions
): ResolvedPlugin {
  const resolved: ResolvedPlugin = {};
  // pluginPath needed to be an absolute path of plugin directory
  const basedir = resolveOptions?.dir ? resolveOptions.dir : undefined;
  let pluginPath: string = '';
  let pluginOptions: any;
  if (Array.isArray(pluginConfig)) {
    pluginPath = pluginConfig[0] as string;
    pluginOptions = pluginConfig[1];
  } else if (typeof pluginConfig === 'string') {
    pluginPath = pluginConfig;
  } else if (typeof pluginConfig === 'object') {
    let pluginInstance: CorePluginInstance;
    if (isPluginInstance(pluginConfig)) {
      pluginInstance = pluginConfig as CorePluginInstance;
    } else {
      pluginInstance = createPlugin(pluginConfig);
    }
    resolved.core = pluginInstance;
  }
  if (pluginPath) {
    let pluginDir: string = '';
    // resolve corePlugin path
    let corePluginPath: string = '';
    try {
      corePluginPath = resolve.sync(pluginPath, { basedir });
    } catch (e) {
      // console.error('resolving corePlugin path failed', e);
    }

    try {
      if (corePluginPath) {
        let corePluginModule = require(corePluginPath);
        corePluginModule = corePluginModule.default || corePluginModule;
        if (isPluginInstance(corePluginModule)) {
          resolved.core = corePluginModule;
        } else if (typeof corePluginModule === 'function') {
          const pluginInstance = corePluginModule(pluginOptions);
          if (isPluginInstance(pluginInstance)) {
            resolved.core = pluginInstance;
          }
        }
        pluginDir = path.dirname(corePluginPath);
      }
    } catch (e) {
      console.error('error when resolving corePlugin');
    }

    // resolve serverPlugin
    let serverPluginPath: any = '';
    try {
      // pluginDir means corePlugin exsits
      if (pluginDir) {
        serverPluginPath = resolve.sync(path.join(pluginDir, 'server'), {
          basedir
        });
      } else {
        const calculatedPath = path.resolve(
          basedir as string,
          pluginPath,
          'server'
        );
        serverPluginPath = resolve.sync(calculatedPath, { basedir });
      }
    } catch (e) {
      // console.error('resolving serverPlugin path failed', e);
    }

    try {
      if (serverPluginPath) {
        let serverPluginModule = require(serverPluginPath);
        serverPluginModule = serverPluginModule.default || serverPluginModule;
        if (isPluginInstance(serverPluginModule)) {
          resolved.server = serverPluginModule;
        } else if (typeof serverPluginModule === 'function') {
          const pluginInstance = serverPluginModule(pluginOptions);
          if (isPluginInstance(pluginInstance)) {
            resolved.server = pluginInstance;
          }
        }
      }
    } catch (e) {
      console.error('error when resolving serverPlugin');
    }

    // resolve runtimePlugin
    let runtimePluginPath: any = '';
    try {
      if (pluginDir) {
        runtimePluginPath = resolve.sync(path.join(pluginDir, 'runtime'), {
          basedir
        });
      } else {
        const calculatedPath = path.resolve(
          basedir as string,
          pluginPath,
          'runtime'
        );
        runtimePluginPath = resolve.sync(calculatedPath, { basedir });
      }
    } catch (e) {
      // console.error('resolving runtimePlugin path failed', e);
    }

    if (runtimePluginPath) {
      resolved.runtime = {
        plugin: runtimePluginPath,
        options: pluginOptions
      };
    }
  }
  return resolved;
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
  const presetFn: IPresetSpec = (context: IPluginContext) => {
    return preset(context, options);
  };

  return {
    id,
    get: () => presetFn
  };
}

export const resolvePlugins = (
  plugins: IPluginConfig[],
  options: ResolvePluginOptions
): ResolvedPlugin[] => {
  return plugins.map(plugin => resolvePlugin(plugin, options));
};

export function resolvePresets(
  presets: IPresetConfig[],
  options: ResolvePluginOptions
): IPreset[] {
  return presets.map(preset => resolvePreset(preset, options));
}

function initPreset(
  rootDir: string,
  preset: IPreset,
  collection: ResolvedPlugin[]
) {
  const { id, get: getPreset } = preset;
  const { presets, plugins } = getPreset()({});

  if (presets) {
    invariant(
      Array.isArray(presets),
      `presets returned from preset ${id} must be Array.`
    );

    const resolvedPresets = resolvePresets(presets, {
      dir: rootDir
    });

    for (const preset of resolvedPresets) {
      initPreset(rootDir, preset, collection);
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

export function getPlugins(
  rootDir: string,
  config: {
    presets?: IPresetConfig[];
    plugins?: IPluginConfig[];
  }
): ResolvedPlugin[] {
  const presetPlugins: ResolvedPlugin[] = [];
  // init presets
  const presets = resolvePresets(config.presets || [], {
    dir: rootDir
  });

  for (const preset of presets) {
    initPreset(rootDir, preset, presetPlugins);
  }

  // init plugins
  const plugins = resolvePlugins(config.plugins || [], {
    dir: rootDir
  });
  const allPlugins = presetPlugins.concat(plugins);
  return allPlugins;
}
