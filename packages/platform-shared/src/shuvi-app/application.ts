import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { IApplicationOptions, IAppContext } from '../runtime/applicationTypes';
import {
  createPlugin,
  IRuntimePluginConstructor,
  IRuntimeModule,
  IPluginRecord,
  IPluginList
} from '../runtime/lifecycle';
import { Application } from '../runtime/application';

function getPlugins(
  runtime: Partial<IRuntimeModule>,
  pluginRecords: IPluginRecord
) {
  const plugins: IPluginList = [];

  const keys = Object.keys(pluginRecords);
  for (let index = 0; index < keys.length; index++) {
    const name = keys[index];
    const plugin = pluginRecords[name];
    plugins.push([plugin.plugin, plugin.options]);
  }

  const pluginConstructor: IRuntimePluginConstructor = {};
  const methods: Array<keyof typeof runtime> = [
    'getAppComponent',
    'getRootAppComponent',
    'getAppContext',
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

  plugins.push([createPlugin(pluginConstructor)]);
  return plugins;
}

export default function application<Context extends IAppContext>(
  options: IApplicationOptions<Context>
): Application<Context> {
  const application = new Application({
    ...options,
    plugins: getPlugins(customRuntime, pluginRecord)
  });

  return application;
}
