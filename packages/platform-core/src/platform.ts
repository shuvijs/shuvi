import {
  initPlugins,
  Application,
  IApplicationOptions,
  IAppStore
} from '@shuvi/runtime-core';
import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { IRouter } from '@shuvi/router';
import { IApplicationCreaterContext } from './index';

export default function platform<
  Context extends IApplicationCreaterContext,
  Router extends IRouter = IRouter,
  AppStore extends IAppStore = IAppStore
>(
  options: IApplicationOptions<Context, Router, AppStore>,
  isRunPlugins: boolean = true
) {
  const application = new Application(options);
  initPlugins(application.pluginManager, customRuntime, pluginRecord);
  return application;
}
