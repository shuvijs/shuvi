import { IPluginConfig, IApi } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';
import { IPlugin, IPluginSpec } from './types';

export interface ResolvePluginOptions {
  dir: string;
}

let uid = 0;

function resolvePlugin(
  pluginConfig: IPluginConfig,
  resolveOptions: ResolvePluginOptions
): IPlugin {
  let pluginPath: string;
  let name: string;
  let options: any;

  if (Array.isArray(pluginConfig)) {
    if (pluginConfig.length === 2) {
      pluginPath = pluginConfig[0];
      const nameOrOption = pluginConfig[1];
      if (typeof nameOrOption === 'string') {
        name = nameOrOption;
        options = {};
      } else {
        options = nameOrOption;
        name = '';
      }
    } else {
      [pluginPath, options = {}, name = ''] = pluginConfig;
    }
  } else if (typeof pluginConfig === 'string') {
    pluginPath = pluginConfig;
    name = '';
    options = {};
  } else if (typeof pluginConfig === 'function') {
    return {
      id: `InlinePlugin${uid++}`,
      get: () => ({
        apply(api: IApi) {
          pluginConfig(api);
        }
      })
    };
  } else {
    throw new Error(`Plugin must be one of type [string, array, function]`);
  }

  pluginPath = resolve.sync(pluginPath, { basedir: resolveOptions.dir });

  const id = name ? `${pluginPath}@${name}` : pluginPath;
  let pluginInst: IPluginSpec;
  let plugin = require(pluginPath);
  plugin = plugin.default || plugin;
  if (plugin.prototype && typeof plugin.prototype.apply === 'function') {
    // class plugin
    pluginInst = new plugin(options);
  } else {
    // function plugin
    pluginInst = {
      apply(...args: any[]) {
        plugin(...args);
      }
    };
  }

  return {
    id,
    get: () => pluginInst
  };
}

export function resolvePlugins(
  plugins: IPluginConfig[],
  options: ResolvePluginOptions
): IPlugin[] {
  return plugins.map(plugin => resolvePlugin(plugin, options));
}
