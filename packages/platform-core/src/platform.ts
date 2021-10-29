import {
  runPlugins,
  Application,
  IApplicationOptions,
  IAppState,
  IApplicationCreaterContext
} from '@shuvi/runtime-core';
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { IRouter } from '@shuvi/router';

export default function platform<
  Context extends IApplicationCreaterContext,
  Router extends IRouter = IRouter,
  AppState extends IAppState | undefined = undefined
>(
  options: IApplicationOptions<Context, Router, AppState>,
  isRunPlugins: boolean = true
) {
  const application = new Application(options);
  const tap = application.tap.bind(application);
  if (isRunPlugins) runPlugins({ tap, initPlugins, pluginRecord });
  return application;
}
