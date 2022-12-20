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
  DetailedPluginConfig,
  CorePluginConfig
} from './apiTypes';
import { createServerPlugin } from '../server/plugin';

interface ResolvePluginOrPresetOptions {
  dir: string;
}

/**
 * As long as the pluginConfig has any of these key  ['core', 'server', 'runtime', 'types'],
 * we regard it as DetailedPluginConfig
 */
const isDetailedPluginConfig = (
  pluginConfig: DetailedPluginConfig | CorePluginConstructor
): pluginConfig is DetailedPluginConfig => {
  const possibleKeys = ['core', 'server', 'runtime', 'types'];
  if (possibleKeys.some(key => key in pluginConfig)) {
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

const resolvePluginFactory = <T extends (options: unknown) => any>(
  pluginFactory: T,
  options: unknown
): ReturnType<T> | undefined => {
  try {
    const instance = pluginFactory(options);
    return instance;
  } catch (e) {
    logger.error(`error when resolving core plugin factory`, e);
  }
  return undefined;
};

export function resolvePlugin(
  pluginConfig: IPluginConfig,
  resolveOptions?: ResolvePluginOrPresetOptions
): ResolvedPlugin {
  const basedir = resolveOptions?.dir ? resolveOptions.dir : undefined;
  const paths = basedir ? [basedir] : undefined;

  const resolved: ResolvedPlugin = {};
  let pluginBody: string | CorePluginConfig | DetailedPluginConfig;
  let pluginPath: string = '';
  let pluginOptions: any;
  let corePluginPath: string = '';
  let serverPluginPath: string = '';
  let runtimePluginPath: string = '';
  let typesPath: string = '';

  const resolveDetailedPluginConfig = (config: DetailedPluginConfig) => {
    const { core, server, runtime, types } = config;
    if (core) {
      if (typeof core === 'string') {
        corePluginPath = core;
      } else if (typeof core === 'function') {
        const coreInstance = resolvePluginFactory(core, pluginOptions);
        if (coreInstance) {
          resolved.core = coreInstance;
        }
      } else if (typeof core === 'object') {
        if (isPluginInstance(core)) {
          resolved.core = core;
        } else {
          resolved.core = createPlugin(core);
        }
      }
    }

    if (server) {
      if (typeof server === 'string') {
        serverPluginPath = server;
      } else if (typeof server === 'function') {
        const serverInstance = resolvePluginFactory(server, pluginOptions);
        if (serverInstance) {
          resolved.server = serverInstance;
        }
      } else if (typeof server === 'object') {
        if (isPluginInstance(server)) {
          resolved.server = server;
        } else {
          resolved.server = createServerPlugin(server);
        }
      }
    }

    runtime && (runtimePluginPath = runtime);
    types && (typesPath = types);
  };

  if (Array.isArray(pluginConfig)) {
    [pluginBody, pluginOptions] = pluginConfig;
  } else {
    pluginBody = pluginConfig;
  }

  if (!pluginBody) {
    return resolved;
  }

  /** string is normal plugin path */
  if (typeof pluginBody === 'string') {
    pluginPath = pluginBody;

    /** function is CorePluginFactory */
  } else if (typeof pluginBody === 'function') {
    const corePluginInstance = resolvePluginFactory(pluginBody, pluginOptions);
    if (corePluginInstance) {
      resolved.core = corePluginInstance;
    }
    /**
     * object has 3 conditions
     * 1. CorePluginInstance
     * 2. DetailedPluginConfig
     * 3. CorePluginConstructor
     */
  } else if (typeof pluginBody === 'object') {
    if (isPluginInstance<CorePluginInstance>(pluginBody)) {
      resolved.core = pluginBody;
    } else if (isDetailedPluginConfig(pluginBody)) {
      resolveDetailedPluginConfig(pluginBody);
    } else {
      resolved.core = createPlugin(pluginBody);
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
      resolved.types = typesPath;
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
