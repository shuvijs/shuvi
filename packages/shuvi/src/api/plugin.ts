import { IPluginConfig, IApi } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';
import { IPlugin } from './types';

export interface ResolvePluginOptions {
  dir: string;
}

let uid = 0;

function resolvePlugin(
  plugin: IPluginConfig,
  resolveOptions: ResolvePluginOptions
): IPlugin {
  let pluginPath: string;
  let name: string;
  let options: any;

  if (Array.isArray(plugin)) {
    if (plugin.length === 2) {
      pluginPath = plugin[0];
      const nameOrOption = plugin[1];
      if (typeof nameOrOption === 'string') {
        name = nameOrOption;
        options = {};
      } else {
        options = nameOrOption;
        name = '';
      }
    } else {
      [pluginPath, options = {}, name = ''] = plugin;
    }
  } else if (typeof plugin === 'string') {
    pluginPath = plugin;
    name = '';
    options = {};
  } else if (typeof plugin === 'function') {
    return {
      id: `InlinePlugin${uid++}`,
      get: () => (api: IApi) => {
        plugin(api);
      }
    };
  } else {
    throw new Error(`Plugin must be one of type [string, array, function]`);
  }

  pluginPath = resolve.sync(pluginPath, { basedir: resolveOptions.dir });

  const id = name ? `${pluginPath}@${name}` : pluginPath;
  let pluginInst: any = null;
  const pluginFn = (api: IApi) => {
    if (!pluginInst) {
      let plugin = require(pluginPath);
      plugin = plugin.default || plugin;
      if (plugin.prototype && typeof plugin.prototype.apply === 'function') {
        pluginInst = new plugin(options);
      } else {
        pluginInst = {
          apply(...args: any[]) {
            plugin(...args);
          }
        };
      }
    }

    pluginInst.apply(api);
  };

  return {
    id,
    get: () => pluginFn
  };
}

export function resolvePlugins(
  plugins: IPluginConfig[],
  options: ResolvePluginOptions
): IPlugin[] {
  return plugins.map(plugin => resolvePlugin(plugin, options));
}
