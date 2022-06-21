import invariant from '@shuvi/utils/lib/invariant';
import { resolveSync } from '@shuvi/utils/lib/resolve';
import { isPluginInstance, IPluginInstance } from '@shuvi/hook';
import * as path from 'path';
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

function getPluginInstance(
  pluginPath: string,
  pluginOptions: any
): IPluginInstance<any, any> | undefined {
  let pluginModule = require(pluginPath);
  pluginModule = pluginModule.default || pluginModule;
  if (isPluginInstance(pluginModule)) {
    return pluginModule;
  }
  if (typeof pluginModule === 'function') {
    const pluginInstance = pluginModule(pluginOptions);
    if (isPluginInstance(pluginInstance)) {
      return pluginInstance;
    }
  }
  return;
}

export function resolvePlugin(
  pluginConfig: IPluginConfig,
  resolveOptions?: ResolvePluginOptions
): ResolvedPlugin {
  const resolved: ResolvedPlugin = {};
  // pluginPath needed to be an absolute path of plugin directory
  const basedir = resolveOptions?.dir ? resolveOptions.dir : undefined;
  const paths = basedir ? [basedir] : undefined;
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
    let corePluginPath: string = '';
    try {
      corePluginPath = require.resolve(pluginPath, { paths });
    } catch {}

    try {
      if (corePluginPath) {
        const core = getPluginInstance(corePluginPath, pluginOptions);
        if (core) {
          resolved.core = core;
        }
      }
    } catch (e) {
      console.error('error when resolving corePlugin');
    }

    // resolve serverPlugin
    let serverPluginPath: string = '';
    try {
      serverPluginPath = require.resolve(pluginPath + path.sep + 'server', {
        paths
      });
    } catch {}

    try {
      if (serverPluginPath) {
        const server = getPluginInstance(serverPluginPath, pluginOptions);
        if (server) {
          resolved.server = server;
        }
      }
    } catch (e) {
      console.error('error when resolving serverPlugin');
    }

    // resolve runtimePlugin
    let runtimePluginPath: string = '';
    try {
      runtimePluginPath = require.resolve(pluginPath + path.sep + 'runtime', {
        paths
      });
    } catch {}

    if (runtimePluginPath) {
      resolved.runtime = {
        plugin: runtimePluginPath,
        options: pluginOptions
      };
    }

    let typesPath: string = '';
    try {
      typesPath = require.resolve(pluginPath + path.sep + 'types', {
        paths
      });
    } catch {
      try {
        typesPath = require.resolve(pluginPath + path.sep + 'types.d.ts', {
          paths
        });
      } catch {}
    }
    if (typesPath) {
      const dir = path.dirname(typesPath);
      resolved.types = dir + path.sep + 'types';
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

  presetPath = resolveSync(presetPath, { basedir: resolveOptions.dir });

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
