import {
  initPlugins,
  Application,
  IApplicationOptions,
  IAppState
} from '@shuvi/runtime-core';
import * as customRuntime from '@shuvi/app/user/runtime';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { IRouter } from '@shuvi/router';
import { IApplicationCreaterContext } from './index';

export default function platform<
  Context extends IApplicationCreaterContext,
  Router extends IRouter = IRouter,
  AppState extends IAppState | undefined = undefined
>(
  options: IApplicationOptions<Context, Router, AppState>,
  isRunPlugins: boolean = true
) {
  initPlugins(customRuntime, pluginRecord);
  const application = new Application(options);
  return application;
}
