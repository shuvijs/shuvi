import { IApplicationOptions, IAppContext } from './applicationTypes';
import { Application } from './application';
import { initPlugins } from './lifecycle';
import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';

export default function platform<Context extends IAppContext>(
  options: IApplicationOptions<Context>,
  isRunPlugins: boolean = true
) {
  const application = new Application(options);
  initPlugins(application.pluginManager, customRuntime, pluginRecord);
  return application;
}
