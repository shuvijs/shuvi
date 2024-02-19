import * as customApp from '@shuvi/app/user/app';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { ApplicationImpl } from '../shared/application';
import { createRuntimePlugin, IAppModule, ApplicationlOptions } from './shared';
import {
  IRuntimePluginConstructor,
  IPluginRecord,
  IPluginList
} from '../shared/runtimPlugin';

export { ApplicationImpl };

function getPlugins(runtime: IAppModule, pluginRecords: IPluginRecord) {
  const plugins: IPluginList = [];

  const keys = Object.keys(pluginRecords);
  for (let index = 0; index < keys.length; index++) {
    const name = keys[index];
    const plugin = pluginRecords[name];
    plugins.push([plugin.plugin, plugin.options]);
  }

  const pluginConstructor: IRuntimePluginConstructor = {};
  const methods: Array<keyof typeof runtime> = [
    'appComponent',
    'appContext',
    'init',
    'dispose'
  ];

  for (let index = 0; index < methods.length; index++) {
    const method = methods[index];
    if (typeof runtime[method] === 'function') {
      //@ts-ignore
      pluginConstructor[method] = runtime[method];
    }
  }

  plugins.push([
    createRuntimePlugin(pluginConstructor, {
      name: 'shuvi-user-app'
    })
  ]);
  return plugins;
}

export default function application<C extends {}>(
  options: ApplicationlOptions<C>
) {
  const application = new ApplicationImpl({
    ...options,
    getLoaders: async () => {
      const mod = await import(
        /* webpackChunkName: "loaders" */
        '@shuvi/app/files/page-loaders'
      );
      return mod.default || mod;
    },
    plugins: getPlugins(customApp, pluginRecord)
  });

  return application;
}

if (module.hot) {
  module.hot.accept('@shuvi/app/files/page-loaders');
}
