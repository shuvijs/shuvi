import invariant from '@shuvi/utils/lib/invariant';
import { isPluginInstance, IPluginInstance } from '@shuvi/hook';
import logger from '@shuvi/utils/lib/logger';
import * as path from 'path';
import {
  createPlugin,
  CorePluginInstance,
  CorePluginConstructor
} from './plugin';
import {
  IPreset,
  IPluginConfig,
  IPresetConfig,
  IPluginContext,
  ResolvedPlugin,
  ISplitPluginConfig
} from './apiTypes';

interface ResolvePluginOrPresetOptions {
  dir: string;
}

const isInlinePluginConfig = (
  pluginConfig: ISplitPluginConfig | CorePluginConstructor
): pluginConfig is ISplitPluginConfig => {
  const possibleKeys = ['core', 'server', 'runtime', 'types'];
  if (
    possibleKeys.some(key => {
      if (key in pluginConfig) {
        const value = pluginConfig[key as keyof ISplitPluginConfig];
        return typeof value === 'string';
      }
      return false;
    })
  ) {
    return true;
  }
  return false;
};

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
  resolveOptions?: ResolvePluginOrPresetOptions
): ResolvedPlugin {
  const resolved: ResolvedPlugin = {};
  // pluginPath needed to be an absolute path of plugin directory
  const basedir = resolveOptions?.dir ? resolveOptions.dir : undefined;
  const paths = basedir ? [basedir] : undefined;
  let pluginPath: string = '';
  let pluginOptions: any;
  let corePluginPath: string = '';
  let serverPluginPath: string = '';
  let runtimePluginPath: string = '';
  let typesPath: string = '';

  const resolveSplitPluginConfig = (config: ISplitPluginConfig) => {
    const { core, server, runtime, types } = config;
    core && (corePluginPath = core);
    server && (serverPluginPath = server);
    runtime && (runtimePluginPath = runtime);
    types && (typesPath = types);
  };

  /**
   * array has 2 conditions
   * 1. [string, any]
   * 2. [ISplitPluginConfig, any]
   */
  if (Array.isArray(pluginConfig)) {
    const pluginPathOrSplitPluginConfig = pluginConfig[0];
    pluginOptions = pluginConfig[1];
    if (typeof pluginPathOrSplitPluginConfig === 'string') {
      pluginPath = pluginPathOrSplitPluginConfig;
    } else {
      if (isInlinePluginConfig(pluginPathOrSplitPluginConfig)) {
        resolveSplitPluginConfig(pluginPathOrSplitPluginConfig);
      }
    }

    /** string is normal plugin path */
  } else if (typeof pluginConfig === 'string') {
    pluginPath = pluginConfig;

    /**
     * object has 3 conditions
     * 1. CorePluginInstance
     * 2. ISplitPluginConfig
     * 3. CorePluginConstructor
     */
  } else if (typeof pluginConfig === 'object') {
    let pluginInstance: CorePluginInstance | null = null;
    if (isPluginInstance(pluginConfig)) {
      pluginInstance = pluginConfig as CorePluginInstance;
    } else if (isInlinePluginConfig(pluginConfig)) {
      resolveSplitPluginConfig(pluginConfig);
    } else {
      pluginInstance = createPlugin(pluginConfig);
    }
    if (pluginInstance) {
      resolved.core = pluginInstance;
    }
  }

  if (
    pluginPath ||
    corePluginPath ||
    serverPluginPath ||
    runtimePluginPath ||
    typesPath
  ) {
    if (pluginPath && !corePluginPath) {
      try {
        corePluginPath = require.resolve(pluginPath, { paths });
      } catch {}
    }
    try {
      if (corePluginPath) {
        const core = getPluginInstance(corePluginPath, pluginOptions);
        if (core) {
          resolved.core = core;
        }
      }
    } catch (e) {
      logger.error(`error when resolving corePlugin ${corePluginPath}`, e);
    }

    // resolve serverPlugin
    if (pluginPath && !serverPluginPath) {
      try {
        serverPluginPath = require.resolve(pluginPath + path.sep + 'server', {
          paths
        });
      } catch {}
    }

    try {
      if (serverPluginPath) {
        const server = getPluginInstance(serverPluginPath, pluginOptions);
        if (server) {
          resolved.server = server;
        }
      }
    } catch (e) {
      logger.error(`error when resolving serverPlugin ${serverPluginPath}`, e);
    }

    // resolve runtimePlugin
    if (pluginPath && !runtimePluginPath) {
      try {
        runtimePluginPath = require.resolve(pluginPath + path.sep + 'runtime', {
          paths
        });
      } catch {}
    }

    if (runtimePluginPath) {
      resolved.runtime = {
        plugin: runtimePluginPath,
        options: pluginOptions
      };
    }

    if (pluginPath && !typesPath) {
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
    }

    if (typesPath) {
      const dir = path.dirname(typesPath);
      resolved.types = dir + path.sep + 'types';
    }
  }
  return resolved;
}

/** resolve single preset to resolvedPlugins */
export function resolvePreset(
  presetConfig: IPresetConfig,
  resolveOptions: ResolvePluginOrPresetOptions,
  pluginContext: IPluginContext
): ResolvedPlugin[] {
  const collectedPlugins: ResolvedPlugin[] = [];
  let presetPath: string;
  let options: any;

  if (Array.isArray(presetConfig)) {
    presetPath = presetConfig[0];
    options = presetConfig[1];
  } else if (typeof presetConfig === 'string') {
    presetPath = presetConfig;
  } else {
    throw new Error(`Plugin must be one of type [string, array, function]`);
  }
  const basedir = resolveOptions?.dir ? resolveOptions.dir : undefined;
  const paths = basedir ? [basedir] : undefined;
  presetPath = require.resolve(presetPath, { paths });
  const presetModule = require(presetPath);
  const preset: IPreset = presetModule.default || presetModule;

  if (typeof preset === 'function') {
    const presetContent = preset(pluginContext, options);
    const { presets, plugins } = presetContent;

    if (plugins) {
      invariant(
        Array.isArray(plugins),
        `plugins returned from preset ${presetPath} must be Array.`
      );
      const resolvedPlugins = resolvePlugins(plugins, resolveOptions);
      collectedPlugins.push(...resolvedPlugins);
    }

    if (presets) {
      invariant(
        Array.isArray(presets),
        `presets returned from preset ${presetPath} must be Array.`
      );
      presets.forEach(currentPreset => {
        const currentResolvedPlugins = resolvePreset(
          currentPreset,
          resolveOptions,
          pluginContext
        );
        collectedPlugins.push(...currentResolvedPlugins);
      });
    }
  }
  return collectedPlugins;
}

export const resolvePlugins = (
  plugins: IPluginConfig[],
  options: ResolvePluginOrPresetOptions
): ResolvedPlugin[] => {
  return plugins.map(plugin => resolvePlugin(plugin, options));
};

export function resolvePresets(
  presets: IPresetConfig[],
  options: ResolvePluginOrPresetOptions,
  pluginContext: IPluginContext
): ResolvedPlugin[] {
  const allPlugins: ResolvedPlugin[] = [];
  presets.forEach(current => {
    const resolveds = resolvePreset(current, options, pluginContext);
    allPlugins.push(...resolveds);
  });
  return allPlugins;
}

export function getPlugins(
  rootDir: string,
  config: {
    presets?: IPresetConfig[];
    plugins?: IPluginConfig[];
  },
  pluginContext: IPluginContext
): ResolvedPlugin[] {
  // init plugins
  const plugins = resolvePlugins(config.plugins || [], {
    dir: rootDir
  });

  // init presets
  const presetPlugins = resolvePresets(
    config.presets || [],
    {
      dir: rootDir
    },
    pluginContext
  );

  const allPlugins = plugins.concat(presetPlugins);
  return allPlugins;
}
