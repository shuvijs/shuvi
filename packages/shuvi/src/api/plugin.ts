import { IPluginConfig, IApi } from "@shuvi/types";
import { IPlugin } from "./types";

let uid = 0;

function resolvePlugin(plugin: IPluginConfig): IPlugin {
  let pluginPath: string;
  let name: string;
  let options: any;

  if (Array.isArray(plugin)) {
    if (plugin.length === 2) {
      pluginPath = plugin[0];
      const nameOrOption = plugin[1];
      if (typeof nameOrOption === "string") {
        name = nameOrOption;
        options = {};
      } else {
        options = nameOrOption;
        name = "";
      }
    } else {
      [pluginPath, options = {}, name = ""] = plugin;
    }
  } else if (typeof plugin === "string") {
    pluginPath = plugin;
    name = "";
    options = {};
  } else if (typeof plugin === "function") {
    return {
      id: `InlinePlugin${uid++}`,
      get: () => (api: IApi) => {
        plugin(api);
      }
    };
  } else {
    throw new Error(`Plugin must be one of type [string, array, function]`);
  }

  pluginPath = require.resolve(pluginPath);

  const id = `${pluginPath}@${name}`;
  let pluginInst: any = null;
  const pluginFn = (api: IApi) => {
    if (!pluginInst) {
      let plugin = require(pluginPath);
      plugin = plugin.default || plugin;
      pluginInst = new plugin(options);
    }

    pluginInst.apply(api);
  };

  return {
    id,
    get: () => pluginFn
  };
}

export function resolvePlugins(plugins: IPluginConfig[]): IPlugin[] {
  return plugins.map(resolvePlugin);
}
